import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(private prisma: PrismaService) {}

  private toJson(row: {
    id: string;
    name: string;
    phone: string;
    role: string;
    status: string;
    permissions: unknown;
  }) {
    return {
      ...row,
      permissions: Array.isArray(row.permissions) ? row.permissions : [],
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
      }),
      this.prisma.staff.count({ where }),
    ]);

    return {
      list: rows.map((r) => this.toJson(r)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.staff.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('员工不存在');
    }
    return this.toJson(row);
  }

  async create(dto: CreateStaffDto) {
    try {
      const row = await this.prisma.staff.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          role: dto.role,
          status: dto.status ?? '在职',
          permissions: dto.permissions,
        },
      });
      return this.toJson(row);
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
      });
      return this.toJson(row);
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
    await this.findOne(id);
    await this.prisma.staff.delete({ where: { id } });
    return null;
  }
}
