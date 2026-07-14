import { CurrencyCode, type AmountPeriod, type IncomeSource, type Money } from '@finance/shared';
import type { HydratedDocument } from 'mongoose';
import type { RecurringPlanEntity } from '../../recurring-plans/infrastructure/recurring-plan.schema';
import { currentMonthKey } from '../../../common/util/month.util';
import { effectiveAmountForMonth } from '../domain/income.calculations';

type RecurringPlanDoc = HydratedDocument<RecurringPlanEntity>;

/**
 * Maps a persisted recurring-plan document (kind = INCOME) to the framework-free
 * {@link IncomeSource} read model, stripping Mongo internals and deriving the
 * currently-effective amount from the effective-dated history.
 */
export function toIncomeSource(
  doc: RecurringPlanDoc,
  referenceMonth = currentMonthKey(),
): IncomeSource {
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

/** Effective amount for the reference month, falling back to the open/last period. */
function resolveCurrentAmount(history: AmountPeriod[], referenceMonth: string): Money {
  const effective = effectiveAmountForMonth({ amountHistory: history }, referenceMonth);
  if (effective) return effective;

  const open = history.find((p) => p.effectiveTo === null);
  if (open) return open.amount;

  const last = history[history.length - 1];
  return last ? last.amount : { amountMinor: 0, currency: CurrencyCode.USD };
}
