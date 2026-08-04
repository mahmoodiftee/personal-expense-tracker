'use client';

import { PaymentStatus, type MonthKey } from '@finance/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import {
  markVariableExpensePaid,
  markVariableExpenseUnpaid,
  type MonthlyFinanceData,
} from '../api/monthly-finance-api';
import { applyVariableItemPaymentUpdate } from '../lib/calculations';
import { monthlyFinanceQueryKey } from './use-monthly-finance';

export function useToggleVariablePayment(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiClientError,
    { expenseId: string; isPaid: boolean },
    { previous?: MonthlyFinanceData }
  >({
    mutationFn: async ({ expenseId, isPaid }) => {
      if (isPaid) {
        await markVariableExpensePaid(expenseId);
      } else {
        await markVariableExpenseUnpaid(expenseId);
      }
    },
    onMutate: async ({ expenseId, isPaid }) => {
      await queryClient.cancelQueries({ queryKey: monthlyFinanceQueryKey(month) });
      const previous = queryClient.getQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month));

      if (previous) {
        const nextStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID;
        queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), {
          ...previous,
          variable: applyVariableItemPaymentUpdate(previous.variable, expenseId, nextStatus),
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(monthlyFinanceQueryKey(month), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: monthlyFinanceQueryKey(month) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
