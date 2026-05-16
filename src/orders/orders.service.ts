import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ORDER_STATUS } from '../common/constants/enums';
import { generateOrderNo } from '../common/utils/order-no';
import { toOrderJson } from '../common/utils/serialize';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

const NOT_DELETED: Prisma.OrderWhereInput = { deletedAt: null };

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  private buildListWhere(query: QueryOrderDto): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { ...NOT_DELETED };

    if (query.status) {
      where.status = query.status;
    }
    if (query.keyword?.trim()) {
      const kw = query.keyword.trim();
      where.OR = [
        { orderNo: { contains: kw } },
        { customerName: { contains: kw } },
        { phone: { contains: kw } },
        { brand: { contains: kw } },
      ];
    }
    return where;
  }

  async findAll(query: QueryOrderDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where = this.buildListWhere(query);

    const [rows, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      list: rows.map(toOrderJson),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string) {
    const row = await this.prisma.order.findFirst({
      where: { id, ...NOT_DELETED },
    });
    if (!row) {
      throw new NotFoundException('订单不存在');
    }
    return toOrderJson(row);
  }

  async create(dto: CreateOrderDto) {
    const customerId = await this.customers.resolveByPhone({
      phone: dto.phone,
      customerName: dto.customerName,
      wechatNote: dto.wechatNote,
    });
    const row = await this.prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        customerName: dto.customerName,
        phone: dto.phone,
        wechatNote: dto.wechatNote ?? '',
        brand: dto.brand,
        style: dto.style,
        color: dto.color,
        material: dto.material,
        defectDesc: dto.defectDesc,
        defectImages: dto.defectImages ?? [],
        washServices: dto.washServices,
        orderTime: dto.orderTime,
        expectPickupTime: dto.expectPickupTime,
        amount: dto.amount,
        prepay: dto.prepay,
        remark: dto.remark ?? '',
        status: dto.status ?? ORDER_STATUS[0],
        createdAt: BigInt(Date.now()),
        customerId,
      },
    });
    await this.customers.refreshStatsByPhone(dto.phone);
    return toOrderJson(row);
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.findActiveOrThrow(id);
    const phone = dto.phone ?? existing.phone;
    const customerId = dto.phone
      ? await this.customers.resolveByPhone({
          phone,
          customerName: dto.customerName ?? existing.customerName,
          wechatNote: dto.wechatNote ?? existing.wechatNote,
        })
      : existing.customerId;

    const row = await this.prisma.order.update({
      where: { id },
      data: {
        ...(dto.customerName !== undefined && { customerName: dto.customerName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.wechatNote !== undefined && { wechatNote: dto.wechatNote }),
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.style !== undefined && { style: dto.style }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.material !== undefined && { material: dto.material }),
        ...(dto.defectDesc !== undefined && { defectDesc: dto.defectDesc }),
        ...(dto.defectImages !== undefined && {
          defectImages: dto.defectImages,
        }),
        ...(dto.washServices !== undefined && { washServices: dto.washServices }),
        ...(dto.orderTime !== undefined && { orderTime: dto.orderTime }),
        ...(dto.expectPickupTime !== undefined && {
          expectPickupTime: dto.expectPickupTime,
        }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.prepay !== undefined && { prepay: dto.prepay }),
        ...(dto.remark !== undefined && { remark: dto.remark }),
        ...(dto.status !== undefined && { status: dto.status }),
        customerId,
      },
    });
    const phones = new Set([existing.phone, phone]);
    for (const p of phones) {
      await this.customers.refreshStatsByPhone(p);
    }
    return toOrderJson(row);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    await this.findActiveOrThrow(id);
    const row = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });
    return toOrderJson(row);
  }

  async remove(id: string) {
    const existing = await this.findActiveOrThrow(id);
    await this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.customers.refreshStatsByPhone(existing.phone);
    return null;
  }

  private async findActiveOrThrow(id: string) {
    const row = await this.prisma.order.findFirst({
      where: { id, ...NOT_DELETED },
    });
    if (!row) {
      throw new NotFoundException('订单不存在');
    }
    return row;
  }
}
