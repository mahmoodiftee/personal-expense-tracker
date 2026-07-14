import type { Money } from './money';
import type { AmountPeriod, EntityTimestamps, MonthKey } from './models';
import type { Cadence, CurrencyCode, RecurringStatus } from './enums';

/**
 * Income domain read models. An income source is a recurring plan of
 * `kind = INCOME`; these income-flavoured shapes are what the API returns and
 * the web/AI layers consume.
 */

export interface IncomeSource extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  /** Amount effective for the current month (derived from {@link amountHistory}). */
  readonly amount: Money;
  readonly amountHistory: readonly AmountPeriod[];
  readonly cadence: Cadence;
  readonly dueDay: number;
  readonly status: RecurringStatus;
  readonly startMonth: MonthKey;
  readonly endMonth: MonthKey | null;
  readonly categoryId: string | null;
}

export interface MonthlyIncomeSourceItem {
  readonly sourceId: string;
  readonly name: string;
  readonly amount: Money;
}

/** Total expected income for a month, broken down by source. */
export interface MonthlyIncome {
  readonly monthKey: MonthKey;
  readonly currency: CurrencyCode;
  readonly total: Money;
  readonly sources: readonly MonthlyIncomeSourceItem[];
}

export interface IncomeSummaryMonth {
  readonly monthKey: MonthKey;
  readonly total: Money;
}

export interface IncomeSourceShare {
  readonly sourceId: string;
  readonly name: string;
  readonly total: Money;
  readonly sharePct: number;
}

/** Aggregated income across a month range. */
export interface IncomeSummary {
  readonly rangeStart: MonthKey;
  readonly rangeEnd: MonthKey;
  readonly currency: CurrencyCode;
  readonly total: Money;
  readonly monthlyAverage: Money;
  readonly months: readonly IncomeSummaryMonth[];
  readonly bySource: readonly IncomeSourceShare[];
}
