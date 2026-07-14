import { Controller, Get, Query } from '@nestjs/common';
import type {
  ForecastAnalytics,
  MonthlyTrends,
  SavingsTrends,
  SpendingTrends,
} from '@finance/shared';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { AnalyticsService } from '../application/analytics.service';
import {
  AnalyticsRangeQueryDto,
  ForecastAnalyticsQueryDto,
} from '../application/dto/analytics-query.dto';

/**
 * Analytics endpoints (v1). Trend and forecast views for charts and AI context.
 * All routes are static (no `:id` params).
 */
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('monthly-trends')
  getMonthlyTrends(
    @CurrentUserId() userId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ): Promise<MonthlyTrends> {
    return this.service.getMonthlyTrends(userId, query);
  }

  @Get('savings-trends')
  getSavingsTrends(
    @CurrentUserId() userId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ): Promise<SavingsTrends> {
    return this.service.getSavingsTrends(userId, query);
  }

  @Get('spending-trends')
  getSpendingTrends(
    @CurrentUserId() userId: string,
    @Query() query: AnalyticsRangeQueryDto,
  ): Promise<SpendingTrends> {
    return this.service.getSpendingTrends(userId, query);
  }

  @Get('forecast')
  getForecastAnalytics(
    @CurrentUserId() userId: string,
    @Query() query: ForecastAnalyticsQueryDto,
  ): Promise<ForecastAnalytics> {
    return this.service.getForecastAnalytics(userId, query);
  }
}
