'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ErrorStateProps } from '@/types/design-system';

import { FadeIn } from './motion';
import { Typography } from './typography';

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  className,
}: ErrorStateProps & { className?: string }) {
  return (
    <FadeIn>
      <div
        role="alert"
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center',
          className,
        )}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </div>
        <Typography variant="h3" className="mb-2">
          {title}
        </Typography>
        <Typography variant="body-sm" className="mb-6 max-w-md">
          {message}
        </Typography>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </FadeIn>
  );
}
