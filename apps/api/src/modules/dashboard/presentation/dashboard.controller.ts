import { Controller, Get, Query } from '@nestjs/common';
import type { DashboardMonthlyOverview, DashboardOverview } from '@finance/shared';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { DashboardService } from '../application/dashboard.service';
import {
  DashboardMonthlyOverviewQueryDto,
  DashboardQueryDto,
} from '../application/dto/dashboard-query.dto';

/**
 * Dashboard endpoints (v1). Returns composed financial snapshots for the UI.
 * Static routes are declared before any future `:id` params.
 */
@Controller({ path: 'dashboard', version: '1' })
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /** Primary dashboard load: totals, savings, category breakdown, and forecast. */
  @Get()
  getOverview(
    @CurrentUserId() userId: string,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardOverview> {
    return this.service.getOverview(userId, query);
  }

  /** Multi-month trend for income, expenses, and savings charts. */
  @Get('monthly-overview')
  getMonthlyOverview(
    @CurrentUserId() userId: string,
    @Query() query: DashboardMonthlyOverviewQueryDto,
  ): Promise<DashboardMonthlyOverview> {
    return this.service.getMonthlyOverview(userId, query);
  }
}
