import { Module } from '@nestjs/common';
import { SavingsModule } from '../savings/savings.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AnalyticsController } from './presentation/analytics.controller';
import { AnalyticsService } from './application/analytics.service';

/**
 * Analytics feature module. Composes {@link SavingsModule} and
 * {@link TransactionsModule} into trend and forecast analytics — no collection of
 * its own (Computed Pattern, Dependency Inversion).
 *
 * Pre-existing schemas (`monthlyStatements`, `insights`) remain for future
 * caching and AI insight generation; this module reads live computed data.
 */
@Module({
  imports: [SavingsModule, TransactionsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
