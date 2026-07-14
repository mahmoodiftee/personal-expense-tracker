'use client';

import { RouteErrorFallback } from '@/components/page-states';

type SavingsGoalsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SavingsGoalsError({ error, reset }: SavingsGoalsErrorProps) {
  return (
    <RouteErrorFallback
      title="Could not load savings goals"
      message={error.message}
      onRetry={reset}
    />
  );
}
