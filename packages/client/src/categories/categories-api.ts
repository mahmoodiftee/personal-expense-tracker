import type { Category } from '@finance/shared';
import { CategoryKind, Flow, categoryColorFromName } from '@finance/shared';

import { apiFetch } from '../api-client';

/** Sync inline expense labels into the catalogue, then list variable expense categories. */
export async function fetchVariableExpenseCategories(): Promise<Category[]> {
  await apiFetch<{ syncedTransactions: number }>('/categories/sync-from-expenses', {
    method: 'POST',
  });

  const params = new URLSearchParams({
    flow: Flow.EXPENSE,
    kind: CategoryKind.VARIABLE,
  });
  return apiFetch<Category[]>(`/categories?${params.toString()}`);
}

export async function createVariableExpenseCategory(name: string): Promise<Category> {
  return apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      flow: Flow.EXPENSE,
      kind: CategoryKind.VARIABLE,
      color: categoryColorFromName(name.trim()),
    }),
  });
}
