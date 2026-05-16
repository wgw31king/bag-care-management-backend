import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateOrderNo } from '../common/utils/order-no';
import { toOrderJson } from '../common/utils/serialize';
import { CustomersService } from '../customers/customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  async findAll(query: QueryOrderDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const where: Prisma.OrderWhereInput = {};

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
    const row = await this.prisma.order.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('订单不存在');
    }
    return toOrderJson(row);
  }

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { phone: dto.phone },
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
        status: dto.status,
        createdAt: BigInt(Date.now()),
        customerId: customer?.id ?? null,
      },
    });
    await this.customers.refreshStatsByPhone(dto.phone);
    return toOrderJson(row);
  }

  async update(id: string, dto: UpdateOrderDto) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('订单不存在');
    }
    const phone = dto.phone ?? existing.phone;
    let customerId = existing.customerId;
    if (dto.phone && dto.phone !== existing.phone) {
      const customer = await this.prisma.customer.findUnique({
        where: { phone: dto.phone },
      });
      customerId = customer?.id ?? null;
    }
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

  async remove(id: string) {
    const existing = await this.prisma.order.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('订单不存在');
    }
    await this.prisma.order.delete({ where: { id } });
    await this.customers.refreshStatsByPhone(existing.phone);
    return null;
  }
}
