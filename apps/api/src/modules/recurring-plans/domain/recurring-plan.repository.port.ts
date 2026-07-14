import type {
  Cadence,
  Money,
  MonthKey,
  RecurringKind,
  RecurringPlan,
  RecurringStatus,
} from '@finance/shared';
import type { BaseRepositoryPort } from '../../../common/domain/repository.port';

export const RECURRING_PLAN_REPOSITORY = Symbol('RECURRING_PLAN_REPOSITORY');

export interface CreateRecurringPlanData {
  readonly userId: string;
  readonly kind: RecurringKind;
  readonly categoryId?: string | null;
  readonly name: string;
  readonly initialAmount: Money;
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly startMonth: MonthKey;
  readonly endMonth?: MonthKey | null;
  readonly autoPost?: boolean;
}

export interface UpdateRecurringPlanData {
  readonly name?: string;
  readonly dueDay?: number;
  readonly status?: RecurringStatus;
  readonly endMonth?: MonthKey | null;
  readonly autoPost?: boolean;
}

export interface RecurringPlanQuery {
  readonly kind?: RecurringKind;
  readonly status?: RecurringStatus;
  /** Only plans effective during this month (start/end window match). */
  readonly activeInMonth?: MonthKey;
}

export interface RecurringPlanRepositoryPort extends BaseRepositoryPort<
  RecurringPlan,
  CreateRecurringPlanData,
  UpdateRecurringPlanData
> {
  findMany(userId: string, query?: RecurringPlanQuery): Promise<readonly RecurringPlan[]>;

  /**
   * Appends a new effective-dated amount, closing the previous open period.
   * This is how an income/fixed-expense amount is "edited" without losing
   * history. Returns the updated plan.
   */
  appendAmountPeriod(
    userId: string,
    id: string,
    amount: Money,
    effectiveFrom: MonthKey,
  ): Promise<RecurringPlan | null>;
}
