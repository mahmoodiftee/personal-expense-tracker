import type { Money, SavingsGoal, SavingsGoalTemplate } from '@finance/shared';
import type { BaseRepositoryPort } from '../../../common/domain/repository.port';

export const SAVINGS_GOAL_REPOSITORY = Symbol('SAVINGS_GOAL_REPOSITORY');

export interface CreateSavingsGoalData {
  readonly userId: string;
  readonly name: string;
  readonly template: SavingsGoalTemplate;
  readonly targetAmount: Money;
  readonly currentAmount: Money;
  readonly targetDate: Date | null;
  readonly notes: string | null;
}

export interface UpdateSavingsGoalData {
  readonly name?: string;
  readonly template?: SavingsGoalTemplate;
  readonly targetAmount?: Money;
  readonly currentAmount?: Money;
  readonly targetDate?: Date | null;
  readonly notes?: string | null;
}

export interface SavingsGoalRepositoryPort extends BaseRepositoryPort<
  SavingsGoal,
  CreateSavingsGoalData,
  UpdateSavingsGoalData
> {
  findMany(userId: string): Promise<readonly SavingsGoal[]>;
}
