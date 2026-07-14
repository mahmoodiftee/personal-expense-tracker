import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RECURRING_PLAN_MODEL } from '../recurring-plans/infrastructure/recurring-plan.model';
import { FixedExpenseController } from './presentation/fixed-expense.controller';
import { FixedExpenseService } from './application/fixed-expense.service';
import { FIXED_EXPENSE_REPOSITORY } from './domain/fixed-expense.repository.port';
import { EXPENSE_PAYMENT_REPOSITORY } from './domain/expense-payment.repository.port';
import { FixedExpenseMongoRepository } from './infrastructure/fixed-expense.mongo.repository';
import { ExpensePaymentMongoRepository } from './infrastructure/expense-payment.mongo.repository';
import { FIXED_EXPENSE_PAYMENT_MODEL } from './infrastructure/expense-payment.schema';

/**
 * Fixed-expense feature module. Wires the controller and service, and binds both
 * repository *ports* to their Mongoose adapters (Repository Pattern + DI).
 *
 * Fixed expenses live in the shared `recurringPlans` collection (constrained to
 * `kind = FIXED_EXPENSE`); their monthly paid/unpaid status lives in the
 * dedicated `fixedExpensePayments` collection.
 */
@Module({
  imports: [MongooseModule.forFeature([RECURRING_PLAN_MODEL, FIXED_EXPENSE_PAYMENT_MODEL])],
  controllers: [FixedExpenseController],
  providers: [
    FixedExpenseService,
    { provide: FIXED_EXPENSE_REPOSITORY, useClass: FixedExpenseMongoRepository },
    { provide: EXPENSE_PAYMENT_REPOSITORY, useClass: ExpensePaymentMongoRepository },
  ],
  exports: [FixedExpenseService],
})
export class FixedExpensesModule {}
