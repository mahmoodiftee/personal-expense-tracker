'use client';

import { RouteErrorFallback } from '@/components/page-states';

type ExpensesErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ExpensesError({ error, reset }: ExpensesErrorProps) {
  return (
    <RouteErrorFallback title="Could not load expenses" message={error.message} onRetry={reset} />
  );
}
