import type {
  FixedExpenseMonthlyStatusItem,
  MonthKey,
  MonthlyExpenseStatus,
  VariableExpense,
} from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

import {
  fixedExpensePayPath,
  fixedExpenseUnpayPath,
  fixedExpensesMonthlyPath,
  variableExpensesPath,
} from '../lib/paths';

export type MonthlyFinanceData = {
  fixed: MonthlyExpenseStatus;
  variable: VariableExpense[];
};

export async function fetchMonthlyFinance(month: MonthKey): Promise<MonthlyFinanceData> {
  const fetchOptions = demoFetchOptions();

  const [fixed, variablePage] = await Promise.all([
    apiFetch<MonthlyExpenseStatus>(fixedExpensesMonthlyPath(month), fetchOptions),
    apiFetchPaginated<VariableExpense>(variableExpensesPath(month), fetchOptions),
  ]);

  return { fixed, variable: variablePage.items };
}

export async function markFixedExpensePaid(
  expenseId: string,
  month: MonthKey,
): Promise<FixedExpenseMonthlyStatusItem> {
  return apiFetch<FixedExpenseMonthlyStatusItem>(fixedExpensePayPath(expenseId), {
    ...demoFetchOptions(),
    method: 'POST',
    body: JSON.stringify({ month }),
  });
}

export async function markFixedExpenseUnpaid(
  expenseId: string,
  month: MonthKey,
): Promise<FixedExpenseMonthlyStatusItem> {
  return apiFetch<FixedExpenseMonthlyStatusItem>(fixedExpenseUnpayPath(expenseId), {
    ...demoFetchOptions(),
    method: 'POST',
    body: JSON.stringify({ month }),
  });
}
