import type { Money } from './money';
import type { EntityTimestamps, MonthKey } from './models';

/**
 * One-off income for a month (bonus, freelance payment, gift) stored as an
 * ad-hoc INCOME transaction — separate from recurring income sources.
 */
export interface ExtraIncome extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly amount: Money;
  readonly description: string;
  readonly notes: string | null;
  readonly occurredAt: string;
  readonly monthKey: MonthKey;
}
