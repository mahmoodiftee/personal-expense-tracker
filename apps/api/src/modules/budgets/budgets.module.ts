import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoriesModule } from '../categories/categories.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { BudgetsService } from './application/budgets.service';
import { CATEGORY_BUDGET_REPOSITORY } from './domain/category-budget.repository.port';
import { CATEGORY_BUDGET_MODEL } from './infrastructure/category-budget.model';
import { CategoryBudgetMongoRepository } from './infrastructure/category-budget.mongo.repository';
import { BudgetsController } from './presentation/budgets.controller';

@Module({
  imports: [
    MongooseModule.forFeature([CATEGORY_BUDGET_MODEL]),
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [BudgetsController],
  providers: [
    BudgetsService,
    { provide: CATEGORY_BUDGET_REPOSITORY, useClass: CategoryBudgetMongoRepository },
  ],
  exports: [BudgetsService],
})
export class BudgetsModule {}
