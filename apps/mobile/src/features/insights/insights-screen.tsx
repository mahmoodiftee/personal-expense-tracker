import {
  SEVERITY_FILTER_OPTIONS,
  VIEWED_INSIGHTS_STORAGE_KEY,
  countUnviewed,
  currentMonthKey,
  filterInsightsBySeverity,
  formatInsightMessage,
  formatMonthLabel,
  groupInsightsByMonth,
  parseViewedInsightIds,
  serializeViewedInsightIds,
  useInsights,
  type SeverityFilter,
} from '@finance/client';
import { InsightSeverity, type MonthKey } from '@finance/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  Typography,
} from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export function InsightsScreen() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [filter, setFilter] = useState<SeverityFilter>('ALL');
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const { data, isLoading, isError, error, refetch, isRefetching } = useInsights(month);

  useEffect(() => {
    void AsyncStorage.getItem(VIEWED_INSIGHTS_STORAGE_KEY).then((raw) => {
      setViewedIds(parseViewedInsightIds(raw));
    });
  }, []);

  const persistViewed = useCallback((next: Set<string>) => {
    setViewedIds(next);
    void AsyncStorage.setItem(VIEWED_INSIGHTS_STORAGE_KEY, serializeViewedInsightIds(next));
  }, []);

  const insights = data ?? [];
  const filtered = useMemo(() => filterInsightsBySeverity(insights, filter), [insights, filter]);
  const groups = useMemo(() => groupInsightsByMonth(filtered), [filtered]);
  const unviewed = countUnviewed(insights, viewedIds);

  return (
    <PageShell
      safeTop={false}
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Alerts</Typography>
          <Typography variant="h1">Insights</Typography>
          <Typography variant="caption">{unviewed} unviewed</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      <View className="flex-row flex-wrap gap-2">
        {SEVERITY_FILTER_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option === 'ALL' ? 'All' : option.toLowerCase()}
            selected={filter === option}
            onPress={() => setFilter(option)}
          />
        ))}
      </View>

      {insights.length > 0 ? (
        <Button
          label="Mark all viewed"
          variant="secondary"
          onPress={() => persistViewed(new Set([...viewedIds, ...insights.map((item) => item.id)]))}
        />
      ) : null}

      {isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </View>
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load insights"
          message={error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && groups.length === 0 ? (
        <EmptyState title="No insights" description="Nothing flagged for this month yet." />
      ) : null}

      {groups.map((group) => (
        <View key={group.monthKey} className="gap-2">
          <Typography variant="h2">
            {group.monthKey === 'undated' ? 'Undated' : formatMonthLabel(group.monthKey)}
          </Typography>
          {group.insights.map((insight) => {
            const viewed = viewedIds.has(insight.id);
            return (
              <Pressable
                key={insight.id}
                onPress={() => {
                  if (viewed) return;
                  persistViewed(new Set([...viewedIds, insight.id]));
                }}
              >
                <Card className={cn(viewed && 'opacity-60')}>
                  <CardContent className="gap-1.5 py-3">
                    <View className="flex-row items-center justify-between gap-2">
                      <Typography variant="label" className={severityColor(insight.severity)}>
                        {insight.severity}
                      </Typography>
                      {!viewed ? (
                        <Typography variant="caption" className="text-primary">
                          New
                        </Typography>
                      ) : null}
                    </View>
                    <Typography variant="body" className="font-semibold">
                      {insight.title}
                    </Typography>
                    <Typography variant="caption">
                      {formatInsightMessage(insight.message)}
                    </Typography>
                  </CardContent>
                </Card>
              </Pressable>
            );
          })}
        </View>
      ))}
    </PageShell>
  );
}

function severityColor(severity: InsightSeverity): string {
  switch (severity) {
    case InsightSeverity.CRITICAL:
      return 'text-destructive';
    case InsightSeverity.WARNING:
      return 'text-warning';
    case InsightSeverity.SUCCESS:
      return 'text-success';
    default:
      return 'text-muted-foreground';
  }
}
