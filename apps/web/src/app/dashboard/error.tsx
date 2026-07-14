'use client';

import { RouteErrorFallback } from '@/components/page-states';

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <RouteErrorFallback title="Could not load dashboard" message={error.message} onRetry={reset} />
  );
}
