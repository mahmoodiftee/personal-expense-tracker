'use client';

import { Loader2 } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LoadingStateProps } from '@/types/design-system';

import { Typography } from './typography';

export function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-8">
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
      <Typography variant="body-sm">{label}</Typography>
    </div>
  );
}

export function LoadingState({
  label,
  rows = 3,
  className,
}: LoadingStateProps & { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label ?? 'Loading content'}
      className={cn('space-y-3', className)}
    >
      {label ? <Typography variant="body-sm">{label}</Typography> : null}
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5" aria-hidden="true">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-8 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}
