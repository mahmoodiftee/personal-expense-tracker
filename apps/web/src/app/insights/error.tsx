'use client';

import { RouteErrorFallback } from '@/components/page-states';

export default function InsightsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback title="Could not load insights" message={error.message} onRetry={reset} />
  );
}
