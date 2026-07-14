import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SavingsModule } from '../savings/savings.module';
import { SavingsGoalsService } from './application/savings-goals.service';
import { SAVINGS_GOAL_REPOSITORY } from './domain/savings-goal.repository.port';
import { SAVINGS_GOAL_MODEL } from './infrastructure/savings-goal.model';
import { SavingsGoalMongoRepository } from './infrastructure/savings-goal.mongo.repository';
import { SavingsGoalsController } from './presentation/savings-goals.controller';

@Module({
  imports: [MongooseModule.forFeature([SAVINGS_GOAL_MODEL]), SavingsModule],
  controllers: [SavingsGoalsController],
  providers: [
    SavingsGoalsService,
    { provide: SAVINGS_GOAL_REPOSITORY, useClass: SavingsGoalMongoRepository },
  ],
  exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
