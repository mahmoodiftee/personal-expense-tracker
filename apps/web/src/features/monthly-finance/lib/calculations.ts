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
  totalCommittedMinor: number;
  totalSpentMinor: number;
  /** Income minus paid fixed bills and variable spending. */
  remainingMinor: number;
  paidCount: number;
  unpaidCount: number;
};

export function sumVariableExpenses(items: readonly VariableExpense[]): number {
  return items.reduce((sum, item) => sum + item.amount.amountMinor, 0);
}

/** Derive live totals from fixed monthly status + variable expense list. */
export function computeMonthlyCalculations(
  fixed: MonthlyExpenseStatus,
  variableItems: readonly VariableExpense[],
  incomeTotalMinor: number,
): MonthlyCalculations {
  const variableTotalMinor = sumVariableExpenses(variableItems);
  const totalSpentMinor = fixed.totalPaid.amountMinor + variableTotalMinor;

  return {
    currency: fixed.currency,
    incomeTotalMinor,
    fixedDueMinor: fixed.totalDue.amountMinor,
    fixedPaidMinor: fixed.totalPaid.amountMinor,
    fixedUnpaidMinor: fixed.totalUnpaid.amountMinor,
    variableTotalMinor,
    totalCommittedMinor: fixed.totalDue.amountMinor + variableTotalMinor,
    totalSpentMinor,
    remainingMinor: incomeTotalMinor - totalSpentMinor,
    paidCount: fixed.paidCount,
    unpaidCount: fixed.unpaidCount,
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

export function formatCalculationMoney(amountMinor: number, currency: CurrencyCode): string {
  return formatMoney(moneyFromMinor(amountMinor, currency));
}
