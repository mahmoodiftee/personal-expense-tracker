'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';

import { createSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from '../api/savings-goals-api';
import type { SavingsGoalFormValues } from '../lib/schemas';

async function invalidateGoalQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
}

export function useCreateSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: SavingsGoalFormValues) => createSavingsGoal(values),
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}

export function useUpdateSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: SavingsGoalFormValues }) =>
      updateSavingsGoal(id, values),
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}

export function useDeleteSavingsGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiClientError, string>({
    mutationFn: deleteSavingsGoal,
    onSettled: () => invalidateGoalQueries(queryClient),
  });
}
