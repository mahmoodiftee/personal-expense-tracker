'use client';

import { RouteErrorFallback } from '@/components/page-states';

type FinanceErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FinanceError({ error, reset }: FinanceErrorProps) {
  return (
    <RouteErrorFallback
      title="Could not load monthly finance"
      message={error.message}
      onRetry={reset}
    />
  );
}
