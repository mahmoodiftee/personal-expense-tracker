import type { Money } from './money';
import type { EntityTimestamps, MonthKey } from './models';

/**
 * Variable-expense domain read models. A variable expense is an ad-hoc expense
 * transaction (`flow = EXPENSE`, no recurring plan) with a "dynamic" category
 * captured as a snapshot. Ledger internals (flow, recurringPlanId) are hidden
 * from this feature's API surface.
 */

export interface VariableExpenseCategory {
  /** Null while the category is dynamic (not yet in a Categories catalogue). */
  readonly id: string | null;
  readonly name: string;
  readonly color: string;
  readonly icon: string;
}

export interface VariableExpense extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly amount: Money;
  readonly category: VariableExpenseCategory;
  readonly description: string;
  readonly notes: string | null;
  readonly tags: readonly string[];
  readonly occurredAt: string; // ISO-8601 — when the money was spent
  readonly monthKey: MonthKey;
}
