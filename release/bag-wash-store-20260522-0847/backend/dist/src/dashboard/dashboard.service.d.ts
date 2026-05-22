import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(date?: string): Promise<{
        date: string;
        todayCount: number;
        washingCount: number;
        waitPickupCount: number;
        doneCount: number;
        revenue: number;
        prepay: number;
    }>;
    getRevenueTrend(range?: '7d' | '30d'): Promise<{
        range: "7d" | "30d";
        series: {
            date: string;
            amount: number;
            prepay: number;
        }[];
    }>;
}
