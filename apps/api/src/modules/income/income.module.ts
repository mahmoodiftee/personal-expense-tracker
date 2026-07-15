import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from '../transactions/transactions.module';
import { IncomeController } from './presentation/income.controller';
import { IncomeService } from './application/income.service';
import { INCOME_SOURCE_REPOSITORY } from './domain/income-source.repository.port';
import { IncomeSourceMongoRepository } from './infrastructure/income-source.mongo.repository';
import { RECURRING_PLAN_MODEL } from '../recurring-plans/infrastructure/recurring-plan.model';

/**
 * Income feature module. Wires the controller and service, and binds the
 * repository *port* to its Mongoose adapter so the application layer stays
 * decoupled from persistence (Repository Pattern + Dependency Inversion).
 *
 * Income sources live in the shared `recurringPlans` collection; this module
 * registers that schema and constrains all access to `kind = INCOME`.
 */
@Module({
  imports: [MongooseModule.forFeature([RECURRING_PLAN_MODEL]), TransactionsModule],
  controllers: [IncomeController],
  providers: [
    IncomeService,
    { provide: INCOME_SOURCE_REPOSITORY, useClass: IncomeSourceMongoRepository },
  ],
  exports: [IncomeService],
})
export class IncomeModule {}
