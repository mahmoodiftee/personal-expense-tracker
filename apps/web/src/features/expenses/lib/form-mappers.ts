import {
  Cadence,
  MoneyMath,
  PlanSubtype,
  RecurringStatus,
  type FixedExpense,
  type VariableExpense,
} from '@finance/shared';

import { currentMonthKey } from '@/lib/month';

import {
  toDateInputFromIso,
  type FixedExpenseFormValues,
  type VariableExpenseFormValues,
} from './schemas';

export function variableExpenseToFormValues(expense: VariableExpense): VariableExpenseFormValues {
  return {
    description: expense.description,
    amount: MoneyMath.toMajor(expense.amount).toFixed(2),
    occurredOn: toDateInputFromIso(expense.occurredAt),
    categoryId: expense.category.id ?? undefined,
    categoryName: expense.category.name,
    notes: expense.notes ?? '',
  };
}

export function fixedExpenseToFormValues(expense: FixedExpense): FixedExpenseFormValues {
  return {
    name: expense.name,
    amount: MoneyMath.toMajor(expense.amount).toFixed(2),
    dueDay: expense.dueDay,
    cadence: expense.cadence,
    startMonth: expense.startMonth,
    endMonth: expense.endMonth ?? '',
    status: expense.status,
    isLoan: expense.planSubtype === PlanSubtype.LOAN,
    principalAmount: expense.principalAmount
      ? MoneyMath.toMajor(expense.principalAmount).toFixed(2)
      : '',
  };
}

export function defaultVariableExpenseFormValues(): VariableExpenseFormValues {
  const today = toDateInputFromIso(new Date().toISOString());
  return {
    description: '',
    amount: '',
    occurredOn: today,
    categoryId: undefined,
    categoryName: '',
    notes: '',
  };
}

export function defaultFixedExpenseFormValues(): FixedExpenseFormValues {
  return {
    name: '',
    amount: '',
    dueDay: 1,
    cadence: Cadence.MONTHLY,
    startMonth: currentMonthKey(),
    endMonth: '',
    status: RecurringStatus.ACTIVE,
    isLoan: false,
    principalAmount: '',
  };
}
