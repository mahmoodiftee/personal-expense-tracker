import {
  currentMonthKey,
  formatMoney,
  formatMonthShort,
  formatPercent,
  useAnalytics,
} from '@finance/client';
import { MoneyMath, type MonthKey } from '@finance/shared';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CategoryGrid } from '@/components/charts/category-grid';
import { DonutChart } from '@/components/charts/donut-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import type { ChartSlice } from '@/components/charts/chart-types';
import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  ProgressBar,
  StatCard,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/providers/theme-provider';

const RANGE_OPTIONS = [
  { value: '3', label: '3m' },
  { value: '6', label: '6m' },
  { value: '12', label: '12m' },
] as const;

export function AnalyticsScreen() {
  const { palette } = useTheme();
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [range, setRange] = useState<'3' | '6' | '12'>('6');
  const monthCount = Number(range);
  const { data, isLoading, isError, error, refetch, isRefetching } = useAnalytics(
    month,
    monthCount,
  );

  const latestSpend = data?.spending.points[data.spending.points.length - 1];
  const donutSlices = useMemo<ChartSlice[]>(() => {
    if (!latestSpend) return [];
    if (latestSpend.topCategories.length > 0) {
      return latestSpend.topCategories.map((item) => ({
        name: item.name,
        color: item.color,
        total: formatMoney(item.total),
        sharePct: item.sharePct,
      }));
    }
    const total = MoneyMath.toMajor(latestSpend.total);
    if (total <= 0) return [];
    return [
      {
        name: 'Fixed',
        color: palette.chart5,
        total: formatMoney(latestSpend.fixed),
        sharePct: (MoneyMath.toMajor(latestSpend.fixed) / total) * 100,
      },
      {
        name: 'Variable',
        color: palette.chart3,
        total: formatMoney(latestSpend.variable),
        sharePct: (MoneyMath.toMajor(latestSpend.variable) / total) * 100,
      },
    ];
  }, [latestSpend, palette.chart3, palette.chart5]);

  return (
    <PageShell
      refreshing={isRefetching}
      onRefresh={() => {
        void refetch();
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Trends</Typography>
          <Typography variant="title">Analytics</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      <SegmentedControl value={range} options={RANGE_OPTIONS} onChange={setRange} />

      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-24 w-full" />
        </View>
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load analytics"
          message={error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {data ? (
        <View className="gap-4">
          <DonutChart
            title="Spending report"
            caption={latestSpend ? formatMonthShort(latestSpend.monthKey) : 'Total'}
            total={
              latestSpend
                ? formatMoney(latestSpend.total)
                : formatMoney(data.monthly.summary.averageExpenses)
            }
            slices={donutSlices}
          />
          <CategoryGrid slices={donutSlices} />

          <View className="flex-row gap-3">
            <StatCard label="Avg income" value={formatMoney(data.monthly.summary.averageIncome)} />
            <StatCard
              label="Avg expenses"
              value={formatMoney(data.monthly.summary.averageExpenses)}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              label="Avg savings"
              value={formatMoney(data.monthly.summary.averageSavings)}
            />
            <StatCard
              label="Savings rate"
              value={formatPercent(data.savings.averageRatePct, 0)}
              caption={`${data.savings.trendDirection.toLowerCase()} trend`}
            />
          </View>

          <MonthlyBarChart
            title="Expenses by month"
            points={data.monthly.points.map((point) => ({
              label: formatMonthShort(point.monthKey),
              value: MoneyMath.toMajor(point.totalExpenses),
            }))}
          />

          <MonthlyBarChart
            title="Savings by month"
            points={data.savings.points.map((point) => ({
              label: formatMonthShort(point.monthKey),
              value: MoneyMath.toMajor(point.savings),
            }))}
          />

          <Card>
            <CardContent className="gap-3">
              <Typography variant="h2">Spending mix</Typography>
              {data.spending.points.map((point) => {
                const max = Math.max(MoneyMath.toMajor(point.total), 1);
                return (
                  <View key={point.monthKey} className="gap-1.5">
                    <View className="flex-row items-center justify-between">
                      <Typography variant="caption" className="text-foreground">
                        {formatMonthShort(point.monthKey)}
                      </Typography>
                      <Typography variant="caption">
                        F {formatMoney(point.fixed)} · V {formatMoney(point.variable)}
                      </Typography>
                    </View>
                    <ProgressBar value={(MoneyMath.toMajor(point.total) / max) * 100} />
                  </View>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-2">
              <Typography variant="h2">Forecast</Typography>
              <Typography variant="body" className="tabular-nums">
                Next avg {formatMoney(data.forecast.projectedAverage)}
              </Typography>
              <Typography variant="caption">
                Projected total {formatMoney(data.forecast.projectedTotal)} · Historical avg{' '}
                {formatMoney(data.forecast.historicalAverage)}
              </Typography>
              {data.forecast.methodComparison.map((method) => (
                <Typography key={method.method} variant="caption">
                  {method.method.replace(/_/g, ' ')} → {formatMoney(method.nextMonthProjected)} (
                  {formatPercent(method.confidencePct, 0)})
                </Typography>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="gap-2">
              <Typography variant="h2">Budget status</Typography>
              {data.budgetStatus.overBudget.length === 0 &&
              data.budgetStatus.underBudget.length === 0 ? (
                <EmptyState
                  title="No budget data"
                  description="Set category budgets to see status."
                />
              ) : (
                <>
                  {data.budgetStatus.overBudget.map((item) => (
                    <Typography key={item.id} variant="caption" className="text-destructive">
                      Over · {item.categoryName}: {formatMoney(item.actual)} /{' '}
                      {formatMoney(item.budget)}
                    </Typography>
                  ))}
                  {data.budgetStatus.underBudget.map((item) => (
                    <Typography key={item.id} variant="caption">
                      Under · {item.categoryName}: {formatMoney(item.actual)} /{' '}
                      {formatMoney(item.budget)}
                    </Typography>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </View>
      ) : null}
    </PageShell>
  );
}
