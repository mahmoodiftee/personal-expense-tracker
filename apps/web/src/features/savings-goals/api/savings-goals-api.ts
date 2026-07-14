import type {
  SavingsGoalTemplate,
  SavingsGoalsOverview,
  SavingsGoalWithProgress,
} from '@finance/shared';

import { apiFetch } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

import { defaultCurrency, toAmountMinor, type SavingsGoalFormValues } from '../lib/schemas';

const fetchOptions = () => demoFetchOptions();

function bodyFromForm(values: SavingsGoalFormValues, currency = defaultCurrency) {
  return {
    template: values.template,
    ...(values.name?.trim() ? { name: values.name.trim() } : {}),
    targetAmount: toAmountMinor(values.targetAmount, currency),
    currentAmount: toAmountMinor(values.currentAmount || '0', currency),
    ...(values.targetDate
      ? { targetDate: new Date(`${values.targetDate}T12:00:00`).toISOString() }
      : {}),
    ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
  };
}

export async function fetchSavingsGoalsOverview(): Promise<SavingsGoalsOverview> {
  return apiFetch<SavingsGoalsOverview>('/savings-goals', fetchOptions());
}

export async function createSavingsGoal(
  values: SavingsGoalFormValues,
): Promise<SavingsGoalWithProgress> {
  return apiFetch<SavingsGoalWithProgress>('/savings-goals', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function updateSavingsGoal(
  id: string,
  values: SavingsGoalFormValues,
): Promise<SavingsGoalWithProgress> {
  return apiFetch<SavingsGoalWithProgress>(`/savings-goals/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify(bodyFromForm(values)),
  });
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/savings-goals/${id}`, {
    ...fetchOptions(),
    method: 'DELETE',
  });
}

export type { SavingsGoalTemplate };
