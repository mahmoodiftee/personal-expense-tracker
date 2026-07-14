'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { apiFetch, type ApiClientError, type ApiFetchOptions } from '@/lib/api-client';

export function useApiQuery<T>(
  queryKey: readonly unknown[],
  path: string,
  options?: Omit<UseQueryOptions<T, ApiClientError>, 'queryKey' | 'queryFn'> & {
    fetchOptions?: ApiFetchOptions;
  },
) {
  const { fetchOptions, ...queryOptions } = options ?? {};

  return useQuery<T, ApiClientError>({
    queryKey,
    queryFn: () => apiFetch<T>(path, fetchOptions),
    ...queryOptions,
  });
}
