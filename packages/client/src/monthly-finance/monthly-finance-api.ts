import type {
  FixedExpenseMonthlyStatusItem,
  MonthKey,
  MonthlyExpenseStatus,
  MonthlyIncome,
  VariableExpense,
} from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '../api-client';
import {
  fixedExpensePayPath,
  fixedExpenseUnpayPath,
  fixedExpensesMonthlyPath,
  variableExpensePayPath,
  variableExpenseUnpayPath,
  variableExpensesPath,
} from './paths';

export type MonthlyFinanceData = {
  fixed: MonthlyExpenseStatus;
  variable: VariableExpense[];
  income: MonthlyIncome;
};

export async function fetchMonthlyFinance(month: MonthKey): Promise<MonthlyFinanceData> {
  const [fixed, variablePage, income] = await Promise.all([
    apiFetch<MonthlyExpenseStatus>(fixedExpensesMonthlyPath(month)),
    apiFetchPaginated<VariableExpense>(variableExpensesPath(month)),
    apiFetch<MonthlyIncome>(`/income/monthly?month=${month}`),
  ]);

  return { fixed, variable: variablePage.items, income };
}

export async function markFixedExpensePaid(
  expenseId: string,
  month: MonthKey,
): Promise<FixedExpenseMonthlyStatusItem> {
  return apiFetch<FixedExpenseMonthlyStatusItem>(fixedExpensePayPath(expenseId), {
    method: 'POST',
    body: JSON.stringify({ month }),
  });
}

export async function markFixedExpenseUnpaid(
  expenseId: string,
  month: MonthKey,
): Promise<FixedExpenseMonthlyStatusItem> {
  return apiFetch<FixedExpenseMonthlyStatusItem>(fixedExpenseUnpayPath(expenseId), {
    method: 'POST',
    body: JSON.stringify({ month }),
  });
}

export async function markVariableExpensePaid(expenseId: string): Promise<VariableExpense> {
  return apiFetch<VariableExpense>(variableExpensePayPath(expenseId), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function markVariableExpenseUnpaid(expenseId: string): Promise<VariableExpense> {
  return apiFetch<VariableExpense>(variableExpenseUnpayPath(expenseId), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
