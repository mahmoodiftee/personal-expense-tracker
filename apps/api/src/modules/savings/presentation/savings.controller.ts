import { Controller, Get, Query } from '@nestjs/common';
import type { MonthlySavings, SavingsHistory, SavingsProjection } from '@finance/shared';
import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { SavingsService } from '../application/savings.service';
import {
  MonthlySavingsQueryDto,
  SavingsHistoryQueryDto,
  SavingsProjectionQueryDto,
} from '../application/dto/savings-query.dto';

/**
 * Savings endpoints (v1). Thin HTTP layer: validates input via DTOs, resolves
 * the tenant via {@link CurrentUserId}, and delegates to {@link SavingsService}.
 * Static routes (`monthly`, `history`, `projection`) are declared without `:id`
 * params — savings is a derived read model, not a CRUD entity.
 */
@Controller({ path: 'savings', version: '1' })
export class SavingsController {
  constructor(private readonly service: SavingsService) {}

  /** Monthly savings calculation for a single month. */
  @Get('monthly')
  getMonthly(
    @CurrentUserId() userId: string,
    @Query() query: MonthlySavingsQueryDto,
  ): Promise<MonthlySavings> {
    return this.service.getMonthly(userId, query);
  }

  /** Savings history across an inclusive month range. */
  @Get('history')
  getHistory(
    @CurrentUserId() userId: string,
    @Query() query: SavingsHistoryQueryDto,
  ): Promise<SavingsHistory> {
    return this.service.getHistory(userId, query);
  }

  /** Forward-looking savings projection using the forecast engine. */
  @Get('projection')
  getProjection(
    @CurrentUserId() userId: string,
    @Query() query: SavingsProjectionQueryDto,
  ): Promise<SavingsProjection> {
    return this.service.getProjection(userId, query);
  }
}
