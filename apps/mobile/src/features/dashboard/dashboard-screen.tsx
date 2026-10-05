import { currentMonthKey, mapDashboardToViewModel, useDashboard } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { useRouter } from 'expo-router';
import { PiggyBank, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { CategoryRows } from '@/components/charts/category-rows';
import { DonutChart } from '@/components/charts/donut-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import {
  EmptyState,
  ErrorState,
  HeroHeader,
  IconChip,
  MoneyText,
  MonthNavigator,
  PageShell,
  QuickActions,
  StatCard,
  Typography,
} from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/providers/theme-provider';

import { DashboardLoanCard } from './dashboard-loan-card';

function DashboardSkeleton() {
  return (
    <View className="gap-4">
      <Skeleton className="h-20 w-full rounded-tile" />
      <View className="flex-row gap-3">
        <Skeleton className="h-36 flex-1" />
        <Skeleton className="h-36 flex-1" />
      </View>
      <Skeleton className="h-56 w-full" />
    </View>
  );
}

export function DashboardScreen() {
  const router = useRouter();
  const { palette } = useTheme();
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
      hero={
        <HeroHeader
          eyebrow="Smart savings"
          value={viewModel?.savings ?? '৳0.00'}
          chip={viewModel?.savingsRate}
          onRightPress={() => router.push('/settings')}
        />
      }
    >
      <MonthNavigator monthKey={month} onChange={setMonth} />

      <QuickActions
        items={[
          { icon: TrendingUp, label: 'Income', onPress: () => router.push('/income') },
          { icon: Receipt, label: 'Expenses', onPress: () => router.push('/expenses') },
          { icon: Wallet, label: 'Budgets', onPress: () => router.push('/budgets') },
          { icon: PiggyBank, label: 'Goals', onPress: () => router.push('/savings-goals') },
        ]}
      />

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
          <View className="flex-row gap-3">
            <StatCard
              variant="accent"
              label="Income"
              value={viewModel.income}
              icon={TrendingUp}
              iconColor={palette.primary}
              iconBackground="#000000"
            />
            <StatCard
              variant="raised"
              label="Expenses"
              value={viewModel.expenses}
              icon={TrendingDown}
              iconColor={palette.chart5}
              iconBackground={palette.card}
            />
          </View>

          <Card variant="raised" className="overflow-hidden">
            <CardContent className="gap-4 py-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <IconChip
                    icon={PiggyBank}
                    color={palette.heroForeground}
                    background={palette.primary}
                    size={36}
                    iconSize={16}
                  />
                  <Typography variant="body" className="font-semibold">
                    Savings
                  </Typography>
                </View>
                <View className="rounded-full bg-primary px-2.5 py-1">
                  <Typography
                    variant="caption"
                    className="text-xs font-semibold"
                    style={{ color: palette.heroForeground }}
                  >
                    {viewModel.savingsRate} of income
                  </Typography>
                </View>
              </View>
              <MoneyText value={viewModel.savings} variant="display" />
              {/* <ProgressBar value={data.overview.snapshot.savings.ratePct} /> */}
            </CardContent>
          </Card>

          <DashboardLoanCard month={month} />

          <MonthlyBarChart
            title="Cash flow"
            points={viewModel.chartPoints.map((point) => ({
              label: point.label,
              value: point.savings,
            }))}
          />

          {viewModel.categoryBreakdown.length > 0 ? (
            <>
              <DonutChart
                title="Spending"
                caption="Total expenses"
                total={viewModel.expenses}
                slices={viewModel.categoryBreakdown}
              />
              <CategoryRows title="Categories" rows={viewModel.categoryBreakdown.slice(0, 6)} />
            </>
          ) : null}
        </View>
      ) : null}
    </PageShell>
  );
}
