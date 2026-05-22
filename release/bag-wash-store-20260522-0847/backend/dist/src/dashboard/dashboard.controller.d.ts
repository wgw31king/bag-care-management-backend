import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { QueryRevenueTrendDto } from './dto/query-revenue-trend.dto';
export declare class DashboardController {
    private dashboard;
    constructor(dashboard: DashboardService);
    getSummary(query: QueryDashboardDto): Promise<{
        date: string;
        todayCount: number;
        washingCount: number;
        waitPickupCount: number;
        doneCount: number;
        revenue: number;
        prepay: number;
    }>;
    getStats(query: QueryDashboardDto): Promise<{
        date: string;
        todayCount: number;
        washingCount: number;
        waitPickupCount: number;
        doneCount: number;
        revenue: number;
        prepay: number;
    }>;
    getRevenueTrend(query: QueryRevenueTrendDto): Promise<{
        range: "7d" | "30d";
        series: {
            date: string;
            amount: number;
            prepay: number;
        }[];
    }>;
}
