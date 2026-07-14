import { Module } from '@nestjs/common';
import { BudgetsModule } from '../budgets/budgets.module';
import { SavingsModule } from '../savings/savings.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { DashboardController } from './presentation/dashboard.controller';
import { DashboardService } from './application/dashboard.service';

/**
 * Dashboard feature module. Composes {@link SavingsModule} and
 * {@link TransactionsModule} into a single UI-oriented read API — no collection
 * of its own (Computed Pattern, Dependency Inversion).
 */
@Module({
  imports: [SavingsModule, TransactionsModule, BudgetsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
