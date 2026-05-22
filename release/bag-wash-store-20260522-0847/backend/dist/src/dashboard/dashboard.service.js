"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const serialize_1 = require("../common/utils/serialize");
const beijing_date_1 = require("../common/utils/beijing-date");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(date) {
        const day = (0, beijing_date_1.parseDateQuery)(date);
        const active = { deletedAt: null };
        const dayFilter = {
            ...active,
            orderTime: { startsWith: day },
        };
        const [todayCount, washingCount, waitPickupCount, doneCount, amountAgg, prepayAgg,] = await Promise.all([
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
            revenue: (0, serialize_1.decimalToNumber)(amountAgg._sum.amount ?? 0),
            prepay: (0, serialize_1.decimalToNumber)(prepayAgg._sum.prepay ?? 0),
        };
    }
    async getRevenueTrend(range = '7d') {
        const days = range === '30d' ? 30 : 7;
        const end = (0, beijing_date_1.beijingDateString)();
        const start = (0, beijing_date_1.addBeijingDays)(end, -(days - 1));
        const orders = await this.prisma.order.findMany({
            where: {
                deletedAt: null,
                orderTime: { gte: `${start} ` },
            },
            select: { orderTime: true, amount: true, prepay: true },
        });
        const map = new Map();
        for (let i = 0; i < days; i++) {
            const key = (0, beijing_date_1.addBeijingDays)(start, i);
            map.set(key, { amount: 0, prepay: 0 });
        }
        for (const o of orders) {
            const day = o.orderTime.slice(0, 10);
            if (!map.has(day))
                continue;
            const cur = map.get(day);
            cur.amount += (0, serialize_1.decimalToNumber)(o.amount);
            cur.prepay += (0, serialize_1.decimalToNumber)(o.prepay);
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map