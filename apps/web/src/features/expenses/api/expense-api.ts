import type { CurrencyCode, FixedExpense, VariableExpense } from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '@/lib/api-client';
import { demoFetchOptions } from '@/lib/demo-fetch';

import {
  defaultCurrency,
  toAmountMinor,
  toIsoFromDateInput,
  type FixedExpenseFormValues,
  type VariableExpenseFormValues,
} from '../lib/schemas';

const fetchOptions = () => demoFetchOptions();

export async function listFixedExpenses(): Promise<FixedExpense[]> {
  const items = await apiFetch<FixedExpense[]>('/fixed-expenses', fetchOptions());
  return [...items];
}

export async function listVariableExpenses(limit = 100): Promise<VariableExpense[]> {
  const page = await apiFetchPaginated<VariableExpense>(
    `/variable-expenses?limit=${limit}`,
    fetchOptions(),
  );
  return page.items;
}

export async function createVariableExpense(
  values: VariableExpenseFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<VariableExpense> {
  const body = {
    description: values.description,
    amount: toAmountMinor(values.amount, currency),
    occurredAt: toIsoFromDateInput(values.occurredOn),
    notes: values.notes || undefined,
    ...(values.categoryName ? { category: { name: values.categoryName, color: '#64748b' } } : {}),
  };

  return apiFetch<VariableExpense>('/variable-expenses', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateVariableExpense(
  id: string,
  values: VariableExpenseFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<VariableExpense> {
  const body = {
    description: values.description,
    amount: toAmountMinor(values.amount, currency),
    occurredAt: toIsoFromDateInput(values.occurredOn),
    notes: values.notes || null,
    category: values.categoryName ? { name: values.categoryName, color: '#64748b' } : undefined,
  };

  return apiFetch<VariableExpense>(`/variable-expenses/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteVariableExpense(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/variable-expenses/${id}`, {
    ...fetchOptions(),
    method: 'DELETE',
  });
}

export async function createFixedExpense(
  values: FixedExpenseFormValues,
  currency: CurrencyCode = defaultCurrency,
): Promise<FixedExpense> {
  const body = {
    name: values.name,
    amount: toAmountMinor(values.amount, currency),
    cadence: values.cadence,
    dueDay: values.dueDay,
    startMonth: values.startMonth,
    endMonth: values.endMonth || undefined,
  };

  return apiFetch<FixedExpense>('/fixed-expenses', {
    ...fetchOptions(),
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateFixedExpense(
  id: string,
  values: FixedExpenseFormValues,
  currency: CurrencyCode = defaultCurrency,
  effectiveFrom?: string,
): Promise<FixedExpense> {
  const metadataBody = {
    name: values.name,
    dueDay: values.dueDay,
    status: values.status,
    endMonth: values.endMonth || undefined,
  };

  const updated = await apiFetch<FixedExpense>(`/fixed-expenses/${id}`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify(metadataBody),
  });

  await apiFetch<FixedExpense>(`/fixed-expenses/${id}/amount`, {
    ...fetchOptions(),
    method: 'PATCH',
    body: JSON.stringify({
      amount: toAmountMinor(values.amount, currency),
      effectiveFrom: effectiveFrom ?? values.startMonth,
    }),
  });

  return updated;
}

export async function deleteFixedExpense(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/fixed-expenses/${id}`, {
    ...fetchOptions(),
    method: 'DELETE',
  });
}
