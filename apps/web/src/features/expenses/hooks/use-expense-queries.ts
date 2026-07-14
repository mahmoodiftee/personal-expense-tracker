'use client';

import type { FixedExpense, VariableExpense } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import { listFixedExpenses, listVariableExpenses } from '../api/expense-api';

export const fixedExpensesQueryKey = ['expenses', 'fixed'] as const;
export const variableExpensesQueryKey = ['expenses', 'variable'] as const;

export function useFixedExpensesList() {
  return useQuery<FixedExpense[], ApiClientError>({
    queryKey: fixedExpensesQueryKey,
    queryFn: listFixedExpenses,
  });
}

export function useVariableExpensesList() {
  return useQuery<VariableExpense[], ApiClientError>({
    queryKey: variableExpensesQueryKey,
    queryFn: () => listVariableExpenses(),
  });
}
