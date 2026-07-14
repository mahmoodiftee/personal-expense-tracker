'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { StaggerItem, StaggerList } from '@/components/design-system';

import { useInsights } from '../hooks/use-insights';
import { useViewedInsights } from '../hooks/use-viewed-insights';
import { countUnviewed, sortInsightsByPriority } from '../lib/insights-utils';
import { InsightCard } from './insight-card';

const PREVIEW_LIMIT = 3;

type InsightsWidgetProps = {
  month: MonthKey;
};

export function InsightsWidget({ month }: InsightsWidgetProps) {
  const { data, isLoading, isError } = useInsights(month);
  const { isViewed, markViewed, viewedIds, hydrated } = useViewedInsights();

  const preview = useMemo(() => {
    const items = data ?? [];
    return sortInsightsByPriority(items).slice(0, PREVIEW_LIMIT);
  }, [data]);

  const unviewedCount = hydrated ? countUnviewed(data ?? [], viewedIds) : 0;

  return (
    <Card className="overflow-hidden border-border/60 bg-gradient-to-b from-card to-card/80">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <CardTitle>Insights</CardTitle>
            {unviewedCount > 0 ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {unviewedCount} new
              </span>
            ) : null}
          </div>
          <CardDescription>Highlights from your monthly finances</CardDescription>
        </div>
        <Link
          href={'/insights' as Route}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Open center
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            Could not load insights.
          </Typography>
        ) : null}

        {!isLoading && !isError && preview.length === 0 ? (
          <Typography variant="body-sm" className="text-muted-foreground">
            No insights for this month yet. Activity will generate alerts here.
          </Typography>
        ) : null}

        {!isLoading && !isError && preview.length > 0 ? (
          <StaggerList className="space-y-3">
            {preview.map((insight) => (
              <StaggerItem key={insight.id}>
                <InsightCard
                  insight={insight}
                  compact
                  viewed={isViewed(insight.id)}
                  onView={(id) => markViewed(id)}
                />
              </StaggerItem>
            ))}
          </StaggerList>
        ) : null}
      </CardContent>
    </Card>
  );
}
