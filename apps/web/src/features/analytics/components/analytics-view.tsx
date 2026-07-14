'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo, useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Container,
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  StaggerItem,
  StaggerList,
  ThemeToggle,
  Typography,
} from '@/components/design-system';
import { ChartPanelSkeleton } from '@/components/page-states';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { spacing } from '@/lib/design-tokens';
import { currentMonthKey, formatMonthLabel } from '@/lib/month';
import { cn } from '@/lib/utils';

import { DEFAULT_ANALYTICS_MONTHS } from '../api/fetch-analytics';
import { useAnalytics } from '../hooks/use-analytics';
import { isAnalyticsEmpty, mapAnalyticsToViewModel } from '../lib/map-view-model';
import { AnalyticsRangeControls } from './analytics-range-controls';
import { AnalyticsSummaryCards } from './analytics-summary-cards';
import {
  ForecastChart,
  MonthlyComparisonChart,
  SavingsTrendsChart,
  SpendingTrendsChart,
} from './lazy-charts';
import { BudgetAnalyticsSection } from '@/features/budgets/components/budget-analytics-section';

type RangePreset = 3 | 6 | 12;

export function AnalyticsView() {
  const [toMonth, setToMonth] = useState(currentMonthKey());
  const [monthCount, setMonthCount] = useState<RangePreset>(
    DEFAULT_ANALYTICS_MONTHS as RangePreset,
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useAnalytics(
    toMonth,
    monthCount,
  );

  const viewModel = useMemo(() => (data ? mapAnalyticsToViewModel(data) : null), [data]);
  const isEmpty = data ? isAnalyticsEmpty(data) : false;

  return (
    <main className={cn('min-h-screen', spacing.pageY)}>
      <Container className={spacing.section}>
        <PageHeader
          title="Analytics"
          description="Spending and savings trends, forecasts, and monthly comparisons."
          actions={
            <>
              <MonthNavigator
                monthKey={toMonth}
                monthLabel={formatMonthLabel(toMonth)}
                onChange={setToMonth}
              />
              <Link
                href={'/dashboard' as Route}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Dashboard
              </Link>
              <ThemeToggle />
            </>
          }
        />

        {isFetching && !isLoading ? (
          <Typography variant="caption" className="text-muted-foreground" aria-live="polite">
            Updating…
          </Typography>
        ) : null}

        <AnalyticsRangeControls
          monthCount={monthCount}
          rangeLabel={viewModel?.rangeLabel ?? ''}
          onMonthCountChange={setMonthCount}
        />

        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading analytics">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartPanelSkeleton />
              <ChartPanelSkeleton />
            </div>
            <ChartPanelSkeleton />
          </div>
        ) : null}

        {isError ? (
          <ErrorState
            title="Could not load analytics"
            message={error?.message ?? 'Something went wrong while fetching analytics.'}
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && isEmpty ? (
          <EmptyState
            title="No analytics data yet"
            description="Add income and expenses to unlock spending trends, savings analysis, and forecasts."
            action={{ label: 'Manage expenses', href: '/expenses' as Route }}
          />
        ) : null}

        {!isLoading && !isError && data && viewModel && !isEmpty ? (
          <FadeIn>
            <StaggerList className={spacing.section}>
              <StaggerItem>
                <AnalyticsSummaryCards cards={viewModel.summaryCards} />
              </StaggerItem>

              <StaggerItem>
                <div className="grid gap-4 lg:grid-cols-2">
                  <SpendingTrendsChart points={viewModel.spendingPoints} />
                  <SavingsTrendsChart points={viewModel.savingsPoints} />
                </div>
              </StaggerItem>

              <StaggerItem>
                <MonthlyComparisonChart points={viewModel.comparisonPoints} />
              </StaggerItem>

              <StaggerItem>
                <ForecastChart
                  points={viewModel.forecastPoints}
                  confidence={viewModel.forecastConfidence}
                  method={viewModel.forecastMethod}
                  methodComparison={viewModel.methodComparison}
                />
              </StaggerItem>

              <StaggerItem>
                <BudgetAnalyticsSection data={data.budgetStatus} />
              </StaggerItem>
            </StaggerList>
          </FadeIn>
        ) : null}
      </Container>
    </main>
  );
}
