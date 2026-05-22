import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ASSIGNABLE_PERMISSIONS } from '../common/constants/enums';
import { JwtPayload } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  private toJson(
    row: {
      id: string;
      name: string;
      phone: string;
      role: string;
      status: string;
      permissions: unknown;
    },
    username?: string | null,
  ) {
    const raw = Array.isArray(row.permissions) ? row.permissions : [];
    const permissions = raw.filter((p): p is string =>
      (ASSIGNABLE_PERMISSIONS as readonly string[]).includes(p as string),
    );
    return {
      ...row,
      permissions,
      username: username ?? null,
    };
  }

  async findAll(query: QueryStaffDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.StaffWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.keyword?.trim()) {
      const kw = query.keyword.trim();
      where.OR = [
        { name: { contains: kw } },
        { phone: { contains: kw } },
        { role: { contains: kw } },
      ];
    }

    const [rows, total] = await Promise.all([
      this.prisma.staff.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
        include: { user: { select: { username: true } } },
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      list: rows.map((r) => this.toJson(r, r.user?.username)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.staff.findUnique({
      where: { id },
      include: { user: { select: { username: true } } },
    });
    if (!row) {
      throw new NotFoundException('员工不存在');
    }
    return this.toJson(row, row.user?.username);
  }

  async create(dto: CreateStaffDto) {
    if (dto.username === 'admin') {
      throw new BadRequestException('不能创建用户名为 admin 的账号');
    }
    if (!dto.username?.trim() || !dto.password) {
      throw new BadRequestException('新建员工须同时提供登录账号与初始密码');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const row = await tx.staff.create({
          data: {
            name: dto.name,
            phone: dto.phone,
            role: dto.role,
            status: dto.status ?? '在职',
            permissions: dto.permissions,
          },
        });
        const passwordHash = await bcrypt.hash(dto.password, 10);
        await tx.user.create({
          data: {
            username: dto.username.trim(),
            passwordHash,
            displayName: dto.name,
            staffId: row.id,
          },
        });
        return this.toJson(row, dto.username.trim());
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('手机号或登录账号已存在');
      }
      throw e;
    }
  }

  private async syncUserAccount(
    tx: Prisma.TransactionClient,
    staffId: string,
    staffName: string,
    dto: UpdateStaffDto,
    isManager: boolean,
  ) {
    if (dto.username === 'admin') {
      throw new BadRequestException('不能创建用户名为 admin 的账号');
    }
    const linked = await tx.user.findUnique({ where: { staffId } });

    if (dto.password && !dto.username) {
      if (!linked) {
        throw new BadRequestException('该员工尚未开通登录，请同时填写账号与密码');
      }
      if (linked.username === 'admin') {
        throw new BadRequestException('不能修改管理员密码');
      }
      const passwordHash = await bcrypt.hash(dto.password, 10);
      await tx.user.update({
        where: { id: linked.id },
        data: { passwordHash, displayName: staffName },
      });
      return linked.username;
    }

    if (dto.username && !dto.password && linked && isManager) {
      if (linked.username === 'admin') {
        throw new BadRequestException('不能修改管理员登录账号');
      }
      await tx.user.update({
        where: { id: linked.id },
        data: { username: dto.username, displayName: staffName },
      });
      return dto.username;
    }

    if ((dto.username && !dto.password) || (!dto.username && dto.password)) {
      throw new BadRequestException('新建或更换登录账号时 username 与 password 须同时提供');
    }

    if (!dto.username || !dto.password) {
      return linked?.username ?? null;
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    if (linked) {
      if (linked.username === 'admin') {
        throw new BadRequestException('不能修改管理员登录账号');
      }
      await tx.user.update({
        where: { id: linked.id },
        data: {
          username: dto.username,
          passwordHash,
          displayName: staffName,
        },
      });
      return dto.username;
    }

    await tx.user.create({
      data: {
        username: dto.username,
        passwordHash,
        displayName: staffName,
        staffId,
      },
    });
    return dto.username;
  }

  async update(id: string, dto: UpdateStaffDto, actor?: JwtPayload) {
    await this.findOne(id);
    const isManager = Boolean(actor?.isManager);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const row = await tx.staff.update({
          where: { id },
          data: {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.phone !== undefined && { phone: dto.phone }),
            ...(dto.role !== undefined && { role: dto.role }),
            ...(dto.status !== undefined && { status: dto.status }),
            ...(dto.permissions !== undefined && {
              permissions: dto.permissions,
            }),
          },
        });
        const username = await this.syncUserAccount(
          tx,
          id,
          dto.name ?? row.name,
          dto,
          isManager,
        );
        const user = await tx.user.findUnique({
          where: { staffId: id },
          select: { username: true },
        });
        return this.toJson(row, username ?? user?.username ?? null);
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('手机号或登录账号已存在');
      }
      throw e;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.staff.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing) {
      throw new NotFoundException('员工不存在');
    }
    if (existing.user?.username === 'admin') {
      throw new BadRequestException('不能删除管理员关联员工');
    }
    await this.prisma.$transaction([
      this.prisma.user.deleteMany({ where: { staffId: id } }),
      this.prisma.staff.delete({ where: { id } }),
    ]);
    return null;
  }
}
