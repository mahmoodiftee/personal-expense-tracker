'use client';

import { useEffect } from 'react';

import { Container, ErrorState } from '@/components/design-system';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

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
    <main className={cn('min-h-screen', spacing.pageY)}>
      <Container className={spacing.section}>
        <ErrorState
          title={title}
          message={message ?? 'Something went wrong while loading this page.'}
          onRetry={onRetry}
        />
      </Container>
    </main>
  );
}
