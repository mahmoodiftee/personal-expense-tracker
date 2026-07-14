import { Module } from '@nestjs/common';
import { IncomeModule } from '../income/income.module';
import { FixedExpensesModule } from '../fixed-expenses/fixed-expenses.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { SavingsController } from './presentation/savings.controller';
import { SavingsService } from './application/savings.service';

/**
 * Savings feature module. Savings is a *derived* quantity — this module owns no
 * collection. It composes reads from {@link IncomeModule}, {@link FixedExpensesModule},
 * and {@link TransactionsModule} (Dependency Inversion) and applies the pure
 * {@link forecastSavings} engine for projections.
 */
@Module({
  imports: [IncomeModule, FixedExpensesModule, TransactionsModule],
  controllers: [SavingsController],
  providers: [SavingsService],
  exports: [SavingsService],
})
export class SavingsModule {}
