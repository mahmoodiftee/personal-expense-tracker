import type { CurrencyCode, FixedExpense, VariableExpense } from '@finance/shared';
import { PlanSubtype, categoryColorFromName } from '@finance/shared';

import { apiFetch, apiFetchPaginated } from '../api-client';
import {
  defaultCurrency,
  toAmountMinor,
  toIsoFromDateInput,
  type FixedExpenseFormValues,
  type VariableExpenseFormValues,
} from './schemas';

export async function listFixedExpenses(): Promise<FixedExpense[]> {
  const items = await apiFetch<FixedExpense[]>('/fixed-expenses');
  return [...items];
}

export async function listVariableExpenses(limit = 100): Promise<VariableExpense[]> {
  const page = await apiFetchPaginated<VariableExpense>(`/variable-expenses?limit=${limit}`);
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
    ...(values.categoryId
      ? { categoryId: values.categoryId }
      : values.categoryName
        ? {
            category: {
              name: values.categoryName,
              color: categoryColorFromName(values.categoryName),
            },
          }
        : {}),
  };

  return apiFetch<VariableExpense>('/variable-expenses', {
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
    ...(values.categoryId
      ? { categoryId: values.categoryId }
      : values.categoryName
        ? {
            category: {
              name: values.categoryName,
              color: categoryColorFromName(values.categoryName),
            },
          }
        : {}),
  };

  return apiFetch<VariableExpense>(`/variable-expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteVariableExpense(id: string): Promise<void> {
  await apiFetch<{ id: string; deleted: true }>(`/variable-expenses/${id}`, {
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
    planSubtype: values.isLoan ? PlanSubtype.LOAN : PlanSubtype.GENERAL,
    ...(values.isLoan && values.principalAmount
      ? { principalAmount: toAmountMinor(values.principalAmount, currency) }
      : {}),
  };

  return apiFetch<FixedExpense>('/fixed-expenses', {
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
    planSubtype: values.isLoan ? PlanSubtype.LOAN : PlanSubtype.GENERAL,
    principalAmount:
      values.isLoan && values.principalAmount
        ? toAmountMinor(values.principalAmount, currency)
        : null,
  };

  const updated = await apiFetch<FixedExpense>(`/fixed-expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(metadataBody),
  });

  await apiFetch<FixedExpense>(`/fixed-expenses/${id}/amount`, {
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
    method: 'DELETE',
  });
}
