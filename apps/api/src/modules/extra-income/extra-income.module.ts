import { Module } from '@nestjs/common';
import { TransactionsModule } from '../transactions/transactions.module';
import { ExtraIncomeController } from './presentation/extra-income.controller';
import { ExtraIncomeService } from './application/extra-income.service';

@Module({
  imports: [TransactionsModule],
  controllers: [ExtraIncomeController],
  providers: [ExtraIncomeService],
  exports: [ExtraIncomeService],
})
export class ExtraIncomeModule {}
