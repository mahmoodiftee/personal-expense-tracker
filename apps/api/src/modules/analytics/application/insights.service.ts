import { Inject, Injectable } from '@nestjs/common';
import type { Insight } from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import { INSIGHT_REPOSITORY, type InsightRepositoryPort } from '../domain/insight.repository.port';
import type { ListInsightsQueryDto } from './dto/list-insights-query.dto';

@Injectable()
export class InsightsService {
  constructor(
    @Inject(INSIGHT_REPOSITORY)
    private readonly insights: InsightRepositoryPort,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(InsightsService.name);
  }

  async listInsights(userId: string, query: ListInsightsQueryDto): Promise<readonly Insight[]> {
    const items = await this.insights.findMany(userId, {
      monthKey: query.month,
      limit: query.limit,
    });

    this.logger.log(`Insights listed: ${items.length} [user ${userId}]`);
    return items;
  }
}
