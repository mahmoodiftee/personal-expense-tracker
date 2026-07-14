'use client';

import { PaymentStatus, type MonthKey } from '@finance/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import {
  markFixedExpensePaid,
  markFixedExpenseUnpaid,
  type MonthlyFinanceData,
} from '../api/monthly-finance-api';
import { applyFixedItemPaymentUpdate } from '../lib/calculations';
import { monthlyFinanceQueryKey } from './use-monthly-finance';

export function useToggleFixedPayment(month: MonthKey) {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    ApiClientError,
    { expenseId: string; isPaid: boolean },
    { previous?: MonthlyFinanceData }
  >({
    mutationFn: async ({ expenseId, isPaid }) => {
      if (isPaid) {
        await markFixedExpensePaid(expenseId, month);
      } else {
        await markFixedExpenseUnpaid(expenseId, month);
      }
    },
    onMutate: async ({ expenseId, isPaid }) => {
      await queryClient.cancelQueries({ queryKey: monthlyFinanceQueryKey(month) });
      const previous = queryClient.getQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month));

      if (previous) {
        const nextStatus = isPaid ? PaymentStatus.PAID : PaymentStatus.UNPAID;
        queryClient.setQueryData<MonthlyFinanceData>(monthlyFinanceQueryKey(month), {
          ...previous,
          fixed: applyFixedItemPaymentUpdate(previous.fixed, expenseId, nextStatus),
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
    },
  });
}
