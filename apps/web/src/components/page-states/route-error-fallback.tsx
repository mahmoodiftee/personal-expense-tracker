'use client';

import { useEffect } from 'react';

import { ErrorState, PageShell } from '@/components/design-system';

type RouteErrorFallbackProps = {
  title: string;
  message?: string;
  onRetry: () => void;
};

export function RouteErrorFallback({ title, message, onRetry }: RouteErrorFallbackProps) {
  useEffect(() => {
    console.error(`[route-error] ${title}`, message);
  }, [title, message]);

  return (
    <PageShell>
      <ErrorState
        title={title}
        message={message ?? 'Something went wrong while loading this page.'}
        onRetry={onRetry}
      />
    </PageShell>
  );
}
