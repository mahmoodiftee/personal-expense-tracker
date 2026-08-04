'use client';

import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';
import { ApiWarmup } from '@/components/api-warmup';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ApiWarmup />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
