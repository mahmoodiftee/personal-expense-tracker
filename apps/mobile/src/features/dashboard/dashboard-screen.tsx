import { currentMonthKey, mapDashboardToViewModel, useDashboard } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { useRouter } from 'expo-router';
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
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-40 w-full" />
      <View className="flex-row gap-3">
        <Skeleton className="h-28 flex-1" />
        <Skeleton className="h-28 flex-1" />
      </View>
      <View className="flex-row gap-3">
        <Skeleton className="h-28 flex-1" />
        <Skeleton className="h-28 flex-1" />
      </View>
    </View>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isFetching, isRefetching } =
    useDashboard(month);

  const viewModel = data ? mapDashboardToViewModel(data.overview, data.trends) : null;
  const isEmpty =
    data &&
    data.overview.snapshot.totalIncome.amountMinor === 0 &&
    data.overview.snapshot.totalExpenses.amountMinor === 0 &&
    data.trends.months.every(
      (item) => item.totalIncome.amountMinor === 0 && item.totalExpenses.amountMinor === 0,
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
          <Typography variant="label">Overview</Typography>
          <Typography variant="h1">Dashboard</Typography>
        </View>
        <MonthNavigator monthKey={month} onChange={setMonth} />
      </View>

      {isFetching && !isLoading ? <Typography variant="caption">Updating…</Typography> : null}

      {isLoading ? <DashboardSkeleton /> : null}

      {isError ? (
        <ErrorState
          title="Could not load dashboard"
          message={error?.message ?? 'Something went wrong while fetching your data.'}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isLoading && !isError && isEmpty ? (
        <EmptyState
          title="No financial data yet"
          description="Add income sources and expenses to see your dashboard come to life."
          actionLabel="Go to Month"
          onAction={() => router.push('/(tabs)/month')}
        />
      ) : null}

      {!isLoading && !isError && data && viewModel && !isEmpty ? (
        <View className="gap-4">
          <Card>
            <CardContent className="gap-2">
              <Typography variant="label">Smart savings</Typography>
              <Typography variant="display" className="tabular-nums">
                {viewModel.savings}
              </Typography>
              <Typography variant="caption">{viewModel.savingsRate} of income</Typography>
            </CardContent>
          </Card>

          <View className="flex-row gap-3">
            <StatCard label="Income" value={viewModel.income} trend={viewModel.incomeTrend.value} />
            <StatCard
              label="Expenses"
              value={viewModel.expenses}
              hint={`${viewModel.expenseFixed} fixed · ${viewModel.expenseVariable} variable`}
              trend={viewModel.expenseTrend.value}
            />
          </View>

          <View className="flex-row gap-3">
            <StatCard
              label="Savings"
              value={viewModel.savings}
              hint={viewModel.savingsRate}
              trend={viewModel.savingsTrend.value}
            />
            <StatCard
              label="Forecast"
              value={viewModel.forecastAmount ?? '—'}
              hint={
                viewModel.forecastConfidence
                  ? `${viewModel.forecastConfidence} · ${viewModel.forecastMethod}`
                  : viewModel.forecastMethod
              }
            />
          </View>

          <MonthlyBarChart
            title="Cash flow (savings)"
            points={viewModel.chartPoints.map((point) => ({
              label: point.label,
              value: point.savings,
            }))}
          />

          {viewModel.categoryBreakdown.length > 0 ? (
            <Card>
              <CardContent className="gap-3">
                <Typography variant="h2">Spending by category</Typography>
                {viewModel.categoryBreakdown.slice(0, 6).map((item) => (
                  <View key={item.name} className="flex-row items-center justify-between gap-3">
                    <View className="flex-row items-center gap-2">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography variant="body" className="text-sm">
                        {item.name}
                      </Typography>
                    </View>
                    <Typography variant="caption" className="tabular-nums">
                      {item.total}
                    </Typography>
                  </View>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </View>
      ) : null}
    </PageShell>
  );
}
