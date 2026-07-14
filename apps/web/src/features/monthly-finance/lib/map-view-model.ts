import { PaymentStatus, type MonthlyExpenseStatus, type VariableExpense } from '@finance/shared';

import { formatMoney } from '@/lib/format-money';
import { formatMonthLabel } from '@/lib/month';

import {
  computeMonthlyCalculations,
  formatCalculationMoney,
  type MonthlyCalculations,
} from './calculations';

export type FixedExpenseItemView = {
  id: string;
  name: string;
  amount: string;
  dueDay: number;
  isPaid: boolean;
  paidAt: string | null;
};

export type VariableExpenseItemView = {
  id: string;
  description: string;
  amount: string;
  categoryName: string;
  categoryColor: string;
  occurredAt: string;
};

export type MonthlySummaryView = {
  fixedDue: string;
  fixedPaid: string;
  fixedUnpaid: string;
  variableTotal: string;
  totalCommitted: string;
  totalSpent: string;
  paidCount: number;
  unpaidCount: number;
  variableCount: number;
};

export type MonthlyFinanceViewModel = {
  monthKey: string;
  monthLabel: string;
  currency: string;
  fixedItems: FixedExpenseItemView[];
  variableItems: VariableExpenseItemView[];
  summary: MonthlySummaryView;
  calculations: MonthlyCalculations;
};

function mapSummary(calculations: MonthlyCalculations, variableCount: number): MonthlySummaryView {
  const { currency } = calculations;

  return {
    fixedDue: formatCalculationMoney(calculations.fixedDueMinor, currency),
    fixedPaid: formatCalculationMoney(calculations.fixedPaidMinor, currency),
    fixedUnpaid: formatCalculationMoney(calculations.fixedUnpaidMinor, currency),
    variableTotal: formatCalculationMoney(calculations.variableTotalMinor, currency),
    totalCommitted: formatCalculationMoney(calculations.totalCommittedMinor, currency),
    totalSpent: formatCalculationMoney(calculations.totalSpentMinor, currency),
    paidCount: calculations.paidCount,
    unpaidCount: calculations.unpaidCount,
    variableCount,
  };
}

export function mapMonthlyFinanceToViewModel(
  fixed: MonthlyExpenseStatus,
  variableItems: readonly VariableExpense[],
): MonthlyFinanceViewModel {
  const calculations = computeMonthlyCalculations(fixed, variableItems);

  return {
    monthKey: fixed.monthKey,
    monthLabel: formatMonthLabel(fixed.monthKey),
    currency: fixed.currency,
    fixedItems: fixed.items.map((item) => ({
      id: item.expenseId,
      name: item.name,
      amount: formatMoney(item.amount),
      dueDay: item.dueDay,
      isPaid: item.status === PaymentStatus.PAID,
      paidAt: item.paidAt,
    })),
    variableItems: variableItems.map((item) => ({
      id: item.id,
      description: item.description,
      amount: formatMoney(item.amount),
      categoryName: item.category.name,
      categoryColor: item.category.color,
      occurredAt: item.occurredAt,
    })),
    summary: mapSummary(calculations, variableItems.length),
    calculations,
  };
}
