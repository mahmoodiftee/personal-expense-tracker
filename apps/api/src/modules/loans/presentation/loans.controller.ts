import { Controller, Get, Query } from '@nestjs/common';
import type { LoansOverview } from '@finance/shared';

import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { LoansService } from '../application/loans.service';
import { LoansOverviewQueryDto } from '../application/dto/loans-query.dto';

@Controller({ path: 'loans', version: '1' })
export class LoansController {
  constructor(private readonly service: LoansService) {}

  @Get('overview')
  getOverview(
    @CurrentUserId() userId: string,
    @Query() query: LoansOverviewQueryDto,
  ): Promise<LoansOverview> {
    return this.service.getOverview(userId, query.asOf);
  }
}
