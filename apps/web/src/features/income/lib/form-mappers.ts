import {
  Cadence,
  MoneyMath,
  RecurringStatus,
  type ExtraIncome,
  type IncomeSource,
} from '@finance/shared';

import { currentMonthKey } from '@/lib/month';

import {
  toDateInputFromIso,
  type ExtraIncomeFormValues,
  type FixedIncomeFormValues,
} from './schemas';

export function extraIncomeToFormValues(income: ExtraIncome): ExtraIncomeFormValues {
  return {
    description: income.description,
    amount: MoneyMath.toMajor(income.amount).toFixed(2),
    occurredOn: toDateInputFromIso(income.occurredAt),
    notes: income.notes ?? '',
  };
}

export function fixedIncomeToFormValues(source: IncomeSource): FixedIncomeFormValues {
  return {
    name: source.name,
    amount: MoneyMath.toMajor(source.amount).toFixed(2),
    dueDay: source.dueDay,
    cadence: source.cadence,
    startMonth: source.startMonth,
    endMonth: source.endMonth ?? '',
    status: source.status,
  };
}

export function defaultExtraIncomeFormValues(monthKey: string): ExtraIncomeFormValues {
  const today = toDateInputFromIso(new Date().toISOString());
  const occurredOn = monthKey === currentMonthKey() ? today : `${monthKey}-01`;
  return { description: '', amount: '', occurredOn, notes: '' };
}

export function defaultFixedIncomeFormValues(): FixedIncomeFormValues {
  return {
    name: '',
    amount: '',
    dueDay: 1,
    cadence: Cadence.MONTHLY,
    startMonth: currentMonthKey(),
    endMonth: '',
    status: RecurringStatus.ACTIVE,
  };
}
