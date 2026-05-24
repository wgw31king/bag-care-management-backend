import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toWashServiceJson } from '../common/utils/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWashServiceDto } from './dto/create-wash-service.dto';
import { QueryWashServiceDto } from './dto/query-wash-service.dto';
import { UpdateWashServiceDto } from './dto/update-wash-service.dto';

@Injectable()
export class WashServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryWashServiceDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.WashServiceWhereInput = {};

    if (query.keyword?.trim()) {
      where.name = { contains: query.keyword.trim() };
    }
    if (query.enabled === '1') {
      where.enabled = true;
    } else if (query.enabled === '0') {
      where.enabled = false;
    }

    const [rows, total] = await Promise.all([
      this.prisma.washService.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sort: 'asc' },
      }),
      this.prisma.washService.count({ where }),
    ]);

    return {
      list: rows.map(toWashServiceJson),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.washService.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('服务项目不存在');
    }
    return toWashServiceJson(row);
  }

  private async resolveCode(raw?: string): Promise<string> {
    const trimmed = raw?.trim();
    if (trimmed) {
      const exists = await this.prisma.washService.findUnique({
        where: { code: trimmed },
      });
      if (exists) {
        throw new ConflictException('项目编码已存在');
      }
      return trimmed;
    }
    let code: string;
    do {
      code = `svc_${Date.now()}`;
    } while (await this.prisma.washService.findUnique({ where: { code } }));
    return code;
  }

  async create(dto: CreateWashServiceDto) {
    const maxSort = await this.prisma.washService.aggregate({
      _max: { sort: true },
    });
    const code = await this.resolveCode(dto.code);
    const row = await this.prisma.washService.create({
      data: {
        code,
        name: dto.name,
        price: dto.price,
        durationMin: dto.durationMin,
        enabled: dto.enabled ?? true,
        sort: dto.sort ?? (maxSort._max.sort ?? 0) + 1,
      },
    });
    return toWashServiceJson(row);
  }

  async update(id: string, dto: UpdateWashServiceDto) {
    await this.findOne(id);
    const row = await this.prisma.washService.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.durationMin !== undefined && { durationMin: dto.durationMin }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.sort !== undefined && { sort: dto.sort }),
      },
    });
    return toWashServiceJson(row);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.washService.delete({ where: { id } });
    return null;
  }
}
