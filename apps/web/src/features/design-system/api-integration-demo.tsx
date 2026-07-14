'use client';

import type { DashboardOverview } from '@finance/shared';
import type { Route } from 'next';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState, ErrorState, LoadingState, Typography } from '@/components/design-system';
import { useApiQuery } from '@/hooks/use-api-query';

function currentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

type DemoMode = 'live' | 'loading' | 'error' | 'empty';

export function ApiIntegrationDemo() {
  const [mode, setMode] = useState<DemoMode>('live');
  const month = currentMonthKey();

  const query = useApiQuery<DashboardOverview>(['dashboard', month], `/dashboard?month=${month}`, {
    enabled: mode === 'live',
    fetchOptions: {
      userId: process.env.NEXT_PUBLIC_DEMO_USER_ID,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>API integration</CardTitle>
        <CardDescription>
          React Query + shared envelope via <code className="text-xs">useApiQuery</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="API demo states">
          {(['live', 'loading', 'error', 'empty'] as const).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={mode === item ? 'default' : 'outline'}
              onClick={() => setMode(item)}
              role="tab"
              aria-selected={mode === item}
            >
              {item}
            </Button>
          ))}
        </div>

        {mode === 'loading' ? <LoadingState label="Fetching dashboard…" rows={4} /> : null}

        {mode === 'error' ? (
          <ErrorState
            message="Unable to reach the API. Start the backend or check NEXT_PUBLIC_API_BASE_URL."
            onRetry={() => query.refetch()}
          />
        ) : null}

        {mode === 'empty' ? (
          <EmptyState
            title="No transactions yet"
            description="Add income and expenses to see your dashboard populate."
            action={{ label: 'Add expense', href: '/design-system' as Route }}
          />
        ) : null}

        {mode === 'live' ? (
          <>
            {query.isLoading ? <LoadingState label="Fetching dashboard…" rows={4} /> : null}
            {query.isError ? (
              <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
            ) : null}
            {query.isSuccess ? (
              <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">Connected</Badge>
                  <Typography variant="caption">Month {query.data.snapshot.monthKey}</Typography>
                </div>
                <Typography variant="body-sm">
                  Savings rate: {query.data.snapshot.savings.ratePct.toFixed(1)}%
                </Typography>
                <Typography variant="caption" className="block">
                  Categories tracked: {query.data.categoryBreakdown.length}
                </Typography>
              </div>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
