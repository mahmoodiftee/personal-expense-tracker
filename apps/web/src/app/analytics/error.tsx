'use client';

import { RouteErrorFallback } from '@/components/page-states';

type AnalyticsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AnalyticsError({ error, reset }: AnalyticsErrorProps) {
  return (
    <RouteErrorFallback title="Could not load analytics" message={error.message} onRetry={reset} />
  );
}
