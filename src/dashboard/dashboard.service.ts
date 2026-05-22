import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToNumber } from '../common/utils/serialize';
import {
  addBeijingDays,
  beijingDateString,
  parseDateQuery,
} from '../common/utils/beijing-date';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * 仪表盘汇总
   * - todayCount / revenue / prepay：orderTime 日期前缀 = date（北京时间，按日统计）
   * - washing / waitPickup / done：全库有效订单状态计数（实时）
   */
  async getSummary(date?: string) {
    const day = parseDateQuery(date);
    const active: Prisma.OrderWhereInput = { deletedAt: null };
    const dayFilter: Prisma.OrderWhereInput = {
      ...active,
      orderTime: { startsWith: day },
    };

    const [
      todayCount,
      washingCount,
      waitPickupCount,
      doneCount,
      amountAgg,
      prepayAgg,
    ] = await Promise.all([
      this.prisma.order.count({ where: dayFilter }),
      this.prisma.order.count({
        where: { ...active, status: { in: ['washing', 'repairing'] } },
      }),
      this.prisma.order.count({
        where: { ...active, status: 'wait_pickup' },
      }),
      this.prisma.order.count({
        where: { ...active, status: 'picked_up' },
      }),
      this.prisma.order.aggregate({
        where: dayFilter,
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: dayFilter,
        _sum: { prepay: true },
      }),
    ]);

    return {
      date: day,
      todayCount,
      washingCount,
      waitPickupCount,
      doneCount,
      revenue: decimalToNumber(amountAgg._sum.amount ?? 0),
      prepay: decimalToNumber(prepayAgg._sum.prepay ?? 0),
    };
  }

  /** 按日营收趋势（orderTime 日期前缀聚合，北京时间） */
  async getRevenueTrend(range: '7d' | '30d' = '7d') {
    const days = range === '30d' ? 30 : 7;
    const end = beijingDateString();
    const start = addBeijingDays(end, -(days - 1));

    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        orderTime: { gte: `${start} ` },
      },
      select: { orderTime: true, amount: true, prepay: true },
    });

    const map = new Map<string, { amount: number; prepay: number }>();
    for (let i = 0; i < days; i++) {
      const key = addBeijingDays(start, i);
      map.set(key, { amount: 0, prepay: 0 });
    }

    for (const o of orders) {
      const day = o.orderTime.slice(0, 10);
      if (!map.has(day)) continue;
      const cur = map.get(day)!;
      cur.amount += decimalToNumber(o.amount);
      cur.prepay += decimalToNumber(o.prepay);
    }

    const series = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        amount: v.amount,
        prepay: v.prepay,
      }));

    return { range, series };
  }
}
