'use client';

import { RouteErrorFallback } from '@/components/page-states';

export default function BudgetsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback title="Could not load budgets" message={error.message} onRetry={reset} />
  );
}
