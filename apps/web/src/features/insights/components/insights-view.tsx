'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  PageShell,
  Typography,
} from '@/components/design-system';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { currentMonthKey, formatMonthLabel } from '@/lib/month';

import { useInsights } from '../hooks/use-insights';
import { useViewedInsights } from '../hooks/use-viewed-insights';
import {
  countUnviewed,
  filterInsightsBySeverity,
  groupInsightsByMonth,
  type SeverityFilter,
} from '../lib/insights-utils';
import { InsightsFilterBar } from './insights-filter-bar';
import { InsightsMonthGroup } from './insights-month-group';

export function InsightsView() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const { data, isLoading, isError, error, refetch, isFetching } = useInsights(month);
  const { isViewed, markViewed, markAllViewed, viewedIds, hydrated } = useViewedInsights();

  const insights = data ?? [];

  const filtered = useMemo(
    () => filterInsightsBySeverity(insights, severityFilter),
    [insights, severityFilter],
  );

  const groups = useMemo(() => groupInsightsByMonth(filtered), [filtered]);

  const severityCounts = useMemo(() => {
    const counts: Partial<Record<SeverityFilter, number>> = { ALL: insights.length };
    for (const insight of insights) {
      counts[insight.severity] = (counts[insight.severity] ?? 0) + 1;
    }
    return counts;
  }, [insights]);

  const unviewedCount = hydrated ? countUnviewed(insights, viewedIds) : 0;

  const handleMarkViewed = (id: string) => {
    markViewed(id);
  };

  return (
    <PageShell>
      <PageHeader
        title="Insights Center"
        description="Rule-based financial insights generated from your spending, savings, and budgets."
        actions={
          <>
            <MonthNavigator
              monthKey={month}
              monthLabel={formatMonthLabel(month)}
              onChange={setMonth}
            />
            <Link
              href={'/dashboard' as Route}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Dashboard
            </Link>
          </>
        }
      />

      {isFetching && !isLoading ? (
        <Typography variant="caption" className="text-muted-foreground" aria-live="polite">
          Refreshing insights…
        </Typography>
      ) : null}

      {!isLoading && !isError && insights.length > 0 ? (
        <FadeIn>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>
                {unviewedCount > 0
                  ? `${unviewedCount} new insight${unviewedCount === 1 ? '' : 's'}`
                  : 'All caught up'}
              </span>
            </div>
            {unviewedCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAllViewed(insights.map((item) => item.id))}
              >
                Mark all viewed
              </Button>
            ) : null}
          </div>
        </FadeIn>
      ) : null}

      {!isLoading && !isError && insights.length > 0 ? (
        <div className="mb-6">
          <InsightsFilterBar
            value={severityFilter}
            onChange={setSeverityFilter}
            counts={severityCounts}
          />
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3" aria-busy="true" aria-label="Loading insights">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load insights"
          message={error?.message ?? 'Something went wrong while fetching insights.'}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && insights.length === 0 ? (
        <EmptyState
          title="No insights yet"
          description="Add income and expenses for a month to unlock spending spikes, budget alerts, and savings trends."
          action={{ label: 'Manage expenses', href: '/expenses' as Route }}
        />
      ) : null}

      {!isLoading && !isError && insights.length > 0 && filtered.length === 0 ? (
        <EmptyState
          title="No insights match this filter"
          description="Try another severity filter or check back after more activity this month."
          action={{ label: 'Show all', onClick: () => setSeverityFilter('ALL') }}
        />
      ) : null}

      {!isLoading && !isError && filtered.length > 0 ? (
        <FadeIn>
          <div className="space-y-8">
            {groups.map((group) => (
              <InsightsMonthGroup
                key={group.monthKey}
                group={group}
                isViewed={isViewed}
                onToggleViewed={handleMarkViewed}
              />
            ))}
          </div>
        </FadeIn>
      ) : null}
    </PageShell>
  );
}
