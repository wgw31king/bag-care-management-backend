import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
    return {
      ...row,
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
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
    if ((dto.username && !dto.password) || (!dto.username && dto.password)) {
      throw new BadRequestException('username 与 password 须同时提供');
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
        if (dto.username && dto.password) {
          const passwordHash = await bcrypt.hash(dto.password, 10);
          await tx.user.create({
            data: {
              username: dto.username,
              passwordHash,
              displayName: dto.name,
              staffId: row.id,
            },
          });
        }
        return this.toJson(row, dto.username ?? null);
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

  async update(id: string, dto: UpdateStaffDto) {
    await this.findOne(id);
    try {
      const row = await this.prisma.staff.update({
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
        include: { user: { select: { username: true } } },
      });
      return this.toJson(row, row.user?.username);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException('手机号已存在');
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
