import type { Money } from './money';
import type { EntityTimestamps, MonthKey } from './models';
import type { CurrencyCode } from './enums';

/**
 * Budget domain read models. Monthly limits are set per catalogue category;
 * actual spend is derived from variable expense transactions for the month.
 */

export interface CategoryBudget extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly categoryId: string;
  readonly monthKey: MonthKey;
  readonly limitAmount: Money;
}

export interface CategoryBudgetStatus {
  readonly id: string;
  readonly categoryId: string;
  readonly categoryName: string;
  readonly color: string;
  readonly budget: Money;
  readonly actual: Money;
  readonly remaining: Money;
  /** Share of budget used (can exceed 100 when over budget). */
  readonly usedPct: number;
  readonly isOverBudget: boolean;
}

export interface MonthlyBudgetSummary {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly totalBudget: Money;
  readonly totalActual: Money;
  readonly totalRemaining: Money;
  readonly totalUsedPct: number;
  readonly categories: readonly CategoryBudgetStatus[];
}

export interface BudgetAnalytics {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly overBudget: readonly CategoryBudgetStatus[];
  readonly underBudget: readonly CategoryBudgetStatus[];
}
