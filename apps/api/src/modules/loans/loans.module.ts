import { Module } from '@nestjs/common';

import { FixedExpensesModule } from '../fixed-expenses/fixed-expenses.module';
import { LoansService } from './application/loans.service';
import { LoansController } from './presentation/loans.controller';

@Module({
  imports: [FixedExpensesModule],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
