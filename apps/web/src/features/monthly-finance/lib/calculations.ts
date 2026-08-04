import {
  PaymentStatus,
  type CurrencyCode,
  type Money,
  type MonthlyExpenseStatus,
  type VariableExpense,
} from '@finance/shared';

import { formatMoney } from '@/lib/format-money';

export type MonthlyCalculations = {
  currency: CurrencyCode;
  incomeTotalMinor: number;
  fixedDueMinor: number;
  fixedPaidMinor: number;
  fixedUnpaidMinor: number;
  variableTotalMinor: number;
  variablePaidMinor: number;
  variableUnpaidMinor: number;
  totalCommittedMinor: number;
  totalSpentMinor: number;
  /** Income minus paid fixed bills and paid variable spending. */
  remainingMinor: number;
  paidCount: number;
  unpaidCount: number;
};

export function sumVariableExpensesByStatus(
  items: readonly VariableExpense[],
  status: PaymentStatus,
): number {
  return items
    .filter((item) => item.status === status)
    .reduce((sum, item) => sum + item.amount.amountMinor, 0);
}

/** Derive live totals from fixed monthly status + variable expense list. */
export function computeMonthlyCalculations(
  fixed: MonthlyExpenseStatus,
  variableItems: readonly VariableExpense[],
  incomeTotalMinor: number,
): MonthlyCalculations {
  const variablePaidMinor = sumVariableExpensesByStatus(variableItems, PaymentStatus.PAID);
  const variableUnpaidMinor = sumVariableExpensesByStatus(variableItems, PaymentStatus.UNPAID);
  const variableTotalMinor = variablePaidMinor + variableUnpaidMinor;
  const totalSpentMinor = fixed.totalPaid.amountMinor + variablePaidMinor;
  const variablePaidCount = variableItems.filter(
    (item) => item.status === PaymentStatus.PAID,
  ).length;
  const variableUnpaidCount = variableItems.length - variablePaidCount;

  return {
    currency: fixed.currency,
    incomeTotalMinor,
    fixedDueMinor: fixed.totalDue.amountMinor,
    fixedPaidMinor: fixed.totalPaid.amountMinor,
    fixedUnpaidMinor: fixed.totalUnpaid.amountMinor,
    variableTotalMinor,
    variablePaidMinor,
    variableUnpaidMinor,
    totalCommittedMinor: fixed.totalDue.amountMinor + variableTotalMinor,
    totalSpentMinor,
    remainingMinor: incomeTotalMinor - totalSpentMinor,
    paidCount: fixed.paidCount + variablePaidCount,
    unpaidCount: fixed.unpaidCount + variableUnpaidCount,
  };
}

export function moneyFromMinor(amountMinor: number, currency: CurrencyCode): Money {
  return { amountMinor, currency };
}

export function applyFixedItemPaymentUpdate(
  status: MonthlyExpenseStatus,
  expenseId: string,
  nextStatus: PaymentStatus,
): MonthlyExpenseStatus {
  const items = status.items.map((item) => {
    if (item.expenseId !== expenseId) return item;
    return {
      ...item,
      status: nextStatus,
      paidAt: nextStatus === PaymentStatus.PAID ? new Date().toISOString() : null,
    };
  });

  let fixedPaidMinor = 0;
  let fixedUnpaidMinor = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  for (const item of items) {
    if (item.status === PaymentStatus.PAID) {
      fixedPaidMinor += item.amount.amountMinor;
      paidCount += 1;
    } else {
      fixedUnpaidMinor += item.amount.amountMinor;
      unpaidCount += 1;
    }
  }

  const currency = status.currency;

  return {
    ...status,
    items,
    totalPaid: moneyFromMinor(fixedPaidMinor, currency),
    totalUnpaid: moneyFromMinor(fixedUnpaidMinor, currency),
    paidCount,
    unpaidCount,
  };
}

export function applyVariableItemPaymentUpdate(
  items: readonly VariableExpense[],
  expenseId: string,
  nextStatus: PaymentStatus,
): VariableExpense[] {
  return items.map((item) => {
    if (item.id !== expenseId) return item;
    return {
      ...item,
      status: nextStatus,
      paidAt: nextStatus === PaymentStatus.PAID ? new Date().toISOString() : null,
    };
  });
}

export function formatCalculationMoney(amountMinor: number, currency: CurrencyCode): string {
  return formatMoney(moneyFromMinor(amountMinor, currency));
}
