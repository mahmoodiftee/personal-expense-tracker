import {
  currentMonthKey,
  formatMoney,
  formatMonthShort,
  formatPercent,
  useAnalytics,
} from '@finance/client';
import { MoneyMath, type MonthKey } from '@finance/shared';
import { useState } from 'react';
import { View } from 'react-native';

import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  StatCard,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';

const RANGE_OPTIONS = [
  { value: '3', label: '3m' },
  { value: '6', label: '6m' },
  { value: '12', label: '12m' },
] as const;

export function AnalyticsScreen() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [range, setRange] = useState<'3' | '6' | '12'>('6');
  const monthCount = Number(range);
  const { data, isLoading, isError, error, refetch, isRefetching } = useAnalytics(
    month,
    monthCount,
  );

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
          <Typography variant="h1">Analytics</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      <SegmentedControl value={range} options={RANGE_OPTIONS} onChange={setRange} />

      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
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
              hint={`${data.savings.trendDirection.toLowerCase()} trend`}
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

          <TrendBars
            title="Spending mix"
            rows={data.spending.points.map((point) => ({
              label: formatMonthShort(point.monthKey),
              value: MoneyMath.toMajor(point.total),
              hint: `F ${formatMoney(point.fixed)} · V ${formatMoney(point.variable)}`,
            }))}
          />

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

function TrendBars({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; hint: string }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{title}</Typography>
        {rows.map((row) => (
          <View key={row.label} className="gap-1">
            <View className="flex-row items-center justify-between">
              <Typography variant="caption" className="text-foreground">
                {row.label}
              </Typography>
              <Typography variant="caption">{row.hint}</Typography>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            </View>
          </View>
        ))}
      </CardContent>
    </Card>
  );
}
