'use client';

import Link from 'next/link';
import type { Route } from 'next';
import type { MonthKey } from '@finance/shared';
import { Sparkles } from 'lucide-react';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Typography } from '@/components/design-system';

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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">Insights</CardTitle>
            {unviewedCount > 0 ? (
              <Badge variant="secondary" className="font-normal">
                {unviewedCount} new
              </Badge>
            ) : null}
          </div>
          <CardDescription>Alerts from your spending, budgets, and savings</CardDescription>
        </div>
        <Link
          href={'/insights' as Route}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
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
            No insights for this month yet.
          </Typography>
        ) : null}

        {!isLoading && !isError && preview.length > 0 ? (
          <div className="divide-y divide-border/50">
            {preview.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                compact
                viewed={isViewed(insight.id)}
                onView={(id) => markViewed(id)}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
