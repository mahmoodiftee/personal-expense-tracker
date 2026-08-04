'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiClientError } from '@/lib/api-client';

/** Render free tier can take ~60s to cold-start; retry a few times before failing. */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 4) return false;
  if (error instanceof ApiClientError) {
    return error.status === 0 || error.status >= 502;
  }
  if (error instanceof TypeError) return true;
  return failureCount < 2;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: shouldRetryQuery,
            retryDelay: (attempt) => Math.min(15_000, 2_000 * (attempt + 1)),
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
