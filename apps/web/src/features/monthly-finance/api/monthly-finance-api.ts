import type {
  CurrencyCode,
  FixedExpenseMonthlyStatusItem,
  MonthKey,
  MonthlyExpenseStatus,
  VariableExpense,
} from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '@/lib/api-client';
import { demoFetchOptions } from '@/features/dashboard/lib/demo-fetch';

import {
  fixedExpensePayPath,
  fixedExpenseUnpayPath,
  fixedExpensesMonthlyPath,
  variableExpensePath,
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

export type CreateVariableExpenseInput = {
  description: string;
  amountMajor: number;
  currency: CurrencyCode;
  occurredAt: string;
  categoryName?: string;
};

export async function createVariableExpense(
  input: CreateVariableExpenseInput,
): Promise<VariableExpense> {
  const body = {
    description: input.description,
    amount: {
      amountMinor: Math.round(input.amountMajor * 100),
      currency: input.currency,
    },
    occurredAt: input.occurredAt,
    ...(input.categoryName ? { category: { name: input.categoryName, color: '#64748b' } } : {}),
  };

  return apiFetch<VariableExpense>('/variable-expenses', {
    ...demoFetchOptions(),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function deleteVariableExpense(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(variableExpensePath(id), {
    ...demoFetchOptions(),
    method: 'DELETE',
  });
}
