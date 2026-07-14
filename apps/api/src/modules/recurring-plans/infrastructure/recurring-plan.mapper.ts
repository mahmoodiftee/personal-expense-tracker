import {
  type AmountPeriod,
  type Cadence,
  CurrencyCode,
  type Money,
  type MonthKey,
  type RecurringStatus,
} from '@finance/shared';
import type { HydratedDocument } from 'mongoose';
import { currentMonthKey } from '../../../common/util/month.util';
import { effectiveAmountForMonth } from '../../../common/domain/recurring.calculations';
import type { RecurringPlanEntity } from './recurring-plan.schema';

/**
 * Structural view of a recurring plan. Both `IncomeSource` and `FixedExpense`
 * are assignable from this shape, so one mapper serves both features (DRY).
 */
export interface RecurringPlanView {
  id: string;
  userId: string;
  name: string;
  amount: Money;
  amountHistory: AmountPeriod[];
  cadence: Cadence;
  dueDay: number;
  status: RecurringStatus;
  startMonth: MonthKey;
  endMonth: MonthKey | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Maps a persisted recurring-plan document to the framework-free view, stripping
 * Mongo internals and deriving the amount effective for `referenceMonth`.
 */
export function toRecurringPlanView(
  doc: HydratedDocument<RecurringPlanEntity>,
  referenceMonth: MonthKey = currentMonthKey(),
): RecurringPlanView {
  const amountHistory: AmountPeriod[] = doc.amountHistory.map((period) => ({
    amount: { amountMinor: period.amount.amountMinor, currency: period.amount.currency },
    effectiveFrom: period.effectiveFrom,
    effectiveTo: period.effectiveTo,
  }));

  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: doc.name,
    amount: resolveCurrentAmount(amountHistory, referenceMonth),
    amountHistory,
    cadence: doc.cadence,
    dueDay: doc.dueDay,
    status: doc.status,
    startMonth: doc.startMonth,
    endMonth: doc.endMonth,
    categoryId: doc.categoryId ? doc.categoryId.toString() : null,
    createdAt: (doc as { createdAt?: Date }).createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: (doc as { updatedAt?: Date }).updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function resolveCurrentAmount(history: AmountPeriod[], referenceMonth: MonthKey): Money {
  const effective = effectiveAmountForMonth({ amountHistory: history }, referenceMonth);
  if (effective) return effective;
  const open = history.find((p) => p.effectiveTo === null);
  if (open) return open.amount;
  const last = history[history.length - 1];
  return last ? last.amount : { amountMinor: 0, currency: CurrencyCode.USD };
}
