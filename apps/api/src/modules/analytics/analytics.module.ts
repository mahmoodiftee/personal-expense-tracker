import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FixedExpensesModule } from '../fixed-expenses/fixed-expenses.module';
import { SavingsModule } from '../savings/savings.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AnalyticsController } from './presentation/analytics.controller';
import { InsightsController } from './presentation/insights.controller';
import { AnalyticsService } from './application/analytics.service';
import { InsightsService } from './application/insights.service';
import { INSIGHT_REPOSITORY } from './domain/insight.repository.port';
import { INSIGHT_MODEL } from './infrastructure/insight.model';
import { InsightMongoRepository } from './infrastructure/insight.mongo.repository';

/**
 * Analytics feature module. Composes {@link SavingsModule} and
 * {@link TransactionsModule} into trend and forecast analytics — no collection of
 * its own (Computed Pattern, Dependency Inversion).
 *
 * The `insights` collection is read via {@link InsightsService}; generation is deferred.
 */
@Module({
  imports: [
    MongooseModule.forFeature([INSIGHT_MODEL]),
    SavingsModule,
    FixedExpensesModule,
    TransactionsModule,
  ],
  controllers: [AnalyticsController, InsightsController],
  providers: [
    AnalyticsService,
    InsightsService,
    { provide: INSIGHT_REPOSITORY, useClass: InsightMongoRepository },
  ],
  exports: [AnalyticsService, InsightsService],
})
export class AnalyticsModule {}
