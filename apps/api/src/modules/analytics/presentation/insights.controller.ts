import { Controller, Get, Query } from '@nestjs/common';
import type { Insight } from '@finance/shared';

import { CurrentUserId } from '../../../common/decorators/current-user.decorator';
import { InsightsService } from '../application/insights.service';
import { ListInsightsQueryDto } from '../application/dto/list-insights-query.dto';

@Controller({ path: 'insights', version: '1' })
export class InsightsController {
  constructor(private readonly service: InsightsService) {}

  @Get()
  listInsights(
    @CurrentUserId() userId: string,
    @Query() query: ListInsightsQueryDto,
  ): Promise<readonly Insight[]> {
    return this.service.listInsights(userId, query);
  }
}
