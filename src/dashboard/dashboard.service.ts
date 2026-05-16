import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { decimalToNumber } from '../common/utils/serialize';
import { parseDateQuery, shanghaiDateString } from '../common/utils/shanghai-date';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * 仪表盘汇总
   * - todayCount：orderTime 日期前缀 = date（Asia/Shanghai）
   * - washing/waitPickup/done：全库有效订单状态计数
   * - revenue/prepay：全库有效订单金额合计（与前端 mock 一致，非仅今日）
   */
  async getSummary(date?: string) {
    const day = parseDateQuery(date);
    const active: Prisma.OrderWhereInput = { deletedAt: null };

    const [
      todayCount,
      washingCount,
      waitPickupCount,
      doneCount,
      amountAgg,
      prepayAgg,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { ...active, orderTime: { startsWith: day } },
      }),
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
        where: active,
        _sum: { amount: true },
      }),
      this.prisma.order.aggregate({
        where: active,
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

  /** 按日营收趋势（orderTime 日期前缀聚合） */
  async getRevenueTrend(range: '7d' | '30d' = '7d') {
    const days = range === '30d' ? 30 : 7;
    const end = shanghaiDateString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const start = shanghaiDateString(startDate);

    const orders = await this.prisma.order.findMany({
      where: {
        deletedAt: null,
        orderTime: { gte: `${start} ` },
      },
      select: { orderTime: true, amount: true, prepay: true },
    });

    const map = new Map<string, { amount: number; prepay: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = shanghaiDateString(d);
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
