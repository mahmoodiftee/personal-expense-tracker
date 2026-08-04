'use client';

import { useQuery } from '@tanstack/react-query';

import type { ApiClientError } from '@/lib/api-client';
import type { Category } from '@finance/shared';

import { fetchVariableExpenseCategories } from '../api/categories-api';

export const variableCategoriesQueryKey = ['categories', 'variable'] as const;

export function useVariableCategories() {
  return useQuery<Category[], ApiClientError>({
    queryKey: variableCategoriesQueryKey,
    queryFn: fetchVariableExpenseCategories,
    staleTime: 60_000,
  });
}
