import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { decimalToNumber } from '../common/utils/serialize';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date().toISOString().slice(0, 10);
    const [
      todayCount,
      washingCount,
      waitPickupCount,
      doneCount,
      amountAgg,
      prepayAgg,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { orderTime: { startsWith: today } },
      }),
      this.prisma.order.count({
        where: { status: { in: ['washing', 'repairing'] } },
      }),
      this.prisma.order.count({
        where: { status: 'wait_pickup' },
      }),
      this.prisma.order.count({
        where: { status: 'picked_up' },
      }),
      this.prisma.order.aggregate({ _sum: { amount: true } }),
      this.prisma.order.aggregate({ _sum: { prepay: true } }),
    ]);

    return {
      todayCount,
      washingCount,
      waitPickupCount,
      doneCount,
      revenue: decimalToNumber(amountAgg._sum.amount ?? 0),
      prepay: decimalToNumber(prepayAgg._sum.prepay ?? 0),
    };
  }
}
