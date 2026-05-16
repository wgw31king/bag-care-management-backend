import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCustomerDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.CustomerWhereInput = {};

    if (query.tag) {
      where.tag = query.tag;
    }
    if (query.keyword?.trim()) {
      const kw = query.keyword.trim();
      where.OR = [
        { name: { contains: kw } },
        { phone: { contains: kw } },
        { wechat: { contains: kw } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return { list, total, page, pageSize };
  }

  async findOne(id: string) {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('客户不存在');
    }
    return row;
  }

  async create(dto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          wechat: dto.wechat ?? '',
          tag: dto.tag ?? '普通',
          remark: dto.remark ?? '',
          orderCount: 0,
        },
      });
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

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id);
    try {
      return await this.prisma.customer.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.wechat !== undefined && { wechat: dto.wechat }),
          ...(dto.tag !== undefined && { tag: dto.tag }),
          ...(dto.remark !== undefined && { remark: dto.remark }),
        },
      });
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
    const linkedOrders = await this.prisma.order.count({
      where: { customerId: id, deletedAt: null },
    });
    if (linkedOrders > 0) {
      throw new BadRequestException('该客户存在关联订单，无法删除');
    }
    await this.prisma.customer.delete({ where: { id } });
    return null;
  }

  /** 按手机号查找或自动创建客户（用于订单关联） */
  async resolveByPhone(input: {
    phone: string;
    customerName: string;
    wechatNote?: string;
  }): Promise<string> {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: input.phone },
    });
    if (existing) {
      return existing.id;
    }
    const created = await this.prisma.customer.create({
      data: {
        name: input.customerName,
        phone: input.phone,
        wechat: input.wechatNote ?? '',
        tag: '普通',
        remark: '',
        orderCount: 0,
      },
    });
    return created.id;
  }

  /** 按手机号聚合刷新 orderCount / lastVisit（不含已软删订单） */
  async refreshStatsByPhone(phone: string) {
    const customer = await this.prisma.customer.findUnique({ where: { phone } });
    if (!customer) {
      return;
    }
    const orders = await this.prisma.order.findMany({
      where: { phone, deletedAt: null },
      select: { orderTime: true },
      orderBy: { orderTime: 'desc' },
    });
    const orderCount = orders.length;
    let lastVisit: string | null = null;
    if (orders.length > 0) {
      lastVisit = orders[0].orderTime.slice(0, 10);
    }
    await this.prisma.customer.update({
      where: { id: customer.id },
      data: { orderCount, lastVisit },
    });
  }
}
