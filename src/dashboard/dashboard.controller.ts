import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { QueryRevenueTrendDto } from './dto/query-revenue-trend.dto';

@Controller('dashboard')
@RequirePermissions('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('summary')
  getSummary(@Query() query: QueryDashboardDto) {
    return this.dashboard.getSummary(query.date);
  }

  /** @deprecated 使用 /dashboard/summary */
  @Get('stats')
  getStats(@Query() query: QueryDashboardDto) {
    return this.dashboard.getSummary(query.date);
  }

  @Get('revenue-trend')
  getRevenueTrend(@Query() query: QueryRevenueTrendDto) {
    return this.dashboard.getRevenueTrend(query.range ?? '7d');
  }
}
