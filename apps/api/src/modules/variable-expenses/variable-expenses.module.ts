import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { VariableExpenseController } from './presentation/variable-expense.controller';
import { VariableExpenseService } from './application/variable-expense.service';

/**
 * Variable-expense feature module. Owns no persistence of its own: it consumes
 * the exported transaction repository *port* from {@link TransactionsModule}
 * (Dependency Inversion), keeping ad-hoc expense logic separate from the ledger.
 */
@Module({
  imports: [TransactionsModule],
  controllers: [VariableExpenseController],
  providers: [VariableExpenseService],
  exports: [VariableExpenseService],
})
export class VariableExpensesModule {}
