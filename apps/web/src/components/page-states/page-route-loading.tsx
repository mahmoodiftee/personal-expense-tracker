'use client';

import { Container, StatCardSkeleton } from '@/components/design-system';
import { Skeleton } from '@/components/ui/skeleton';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

import { ChartPanelSkeleton } from './chart-panel-skeleton';

export type PageRouteLoadingVariant = 'dashboard' | 'finance' | 'expenses' | 'analytics';

type PageRouteLoadingProps = {
  variant: PageRouteLoadingVariant;
};

function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

function DashboardLoadingBody() {
  return (
    <div className="space-y-4" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanelSkeleton className="h-64" />
        <ChartPanelSkeleton className="h-64" />
      </div>
      <ChartPanelSkeleton />
    </div>
  );
}

function FinanceLoadingBody() {
  return (
    <div className="space-y-4" aria-label="Loading monthly finance">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-44" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ExpensesLoadingBody() {
  return (
    <div className="space-y-4" aria-label="Loading expenses">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function AnalyticsLoadingBody() {
  return (
    <div className="space-y-4" aria-label="Loading analytics">
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanelSkeleton />
        <ChartPanelSkeleton />
      </div>
      <ChartPanelSkeleton />
      <ChartPanelSkeleton />
    </div>
  );
}

const loadingBodies: Record<PageRouteLoadingVariant, () => JSX.Element> = {
  dashboard: DashboardLoadingBody,
  finance: FinanceLoadingBody,
  expenses: ExpensesLoadingBody,
  analytics: AnalyticsLoadingBody,
};

export function PageRouteLoading({ variant }: PageRouteLoadingProps) {
  const Body = loadingBodies[variant];

  return (
    <main className={cn('min-h-screen', spacing.pageY)} aria-busy="true">
      <Container className={spacing.section}>
        <PageHeaderSkeleton />
        <Body />
      </Container>
    </main>
  );
}
