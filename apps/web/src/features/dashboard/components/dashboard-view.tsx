'use client';

import Link from 'next/link';
import type { Route } from 'next';

import { buttonVariants } from '@/components/ui/button';
import {
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  PageShell,
  StatCardSkeleton,
  StaggerItem,
  StaggerList,
  Typography,
} from '@/components/design-system';
import { spacing } from '@/lib/design-tokens';
import { currentMonthKey } from '@/lib/month';
import { useState } from 'react';

import { useDashboard } from '../hooks/use-dashboard';
import { mapDashboardToViewModel } from '../lib/map-view-model';
import { ExpenseCard } from './expense-card';
import { ForecastCard } from './forecast-card';
import { IncomeCard } from './income-card';
import { CategoryBreakdown, TrendCharts } from './lazy-charts';
import { MonthNavigator } from './month-navigator';
import { SavingsCard } from './savings-card';
import { SavingsGoalsWidget } from '@/features/savings-goals/components/savings-goals-widget';
import { BudgetWidget } from '@/features/budgets/components/budget-widget';
import { InsightsWidget } from '@/features/insights/components/insights-widget';

export function DashboardView() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(month);

  const viewModel = data ? mapDashboardToViewModel(data.overview, data.trends) : null;
  const isEmpty =
    data &&
    data.overview.snapshot.totalIncome.amountMinor === 0 &&
    data.overview.snapshot.totalExpenses.amountMinor === 0 &&
    data.trends.months.every(
      (item) => item.totalIncome.amountMinor === 0 && item.totalExpenses.amountMinor === 0,
    );

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Your monthly financial snapshot with trends and forecasts."
        actions={
          <>
            {viewModel ? (
              <MonthNavigator
                monthKey={viewModel.monthKey}
                monthLabel={viewModel.monthLabel}
                onChange={setMonth}
              />
            ) : null}
            <Link
              href={'/design-system' as Route}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Design system
            </Link>
          </>
        }
      />

      {isFetching && !isLoading ? (
        <Typography variant="caption" className="text-muted-foreground" aria-live="polite">
          Updating…
        </Typography>
      ) : null}

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading dashboard"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load dashboard"
          message={error?.message ?? 'Something went wrong while fetching your data.'}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && isEmpty ? (
        <EmptyState
          title="No financial data yet"
          description="Add income sources and expenses to see your dashboard come to life."
          action={{ label: 'Manage income', href: '/income' as Route }}
        />
      ) : null}

      {!isLoading && !isError && data && viewModel && !isEmpty ? (
        <FadeIn>
          <StaggerList className={spacing.section}>
            <StaggerItem>
              <section
                aria-labelledby="metrics-heading"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                <Typography id="metrics-heading" variant="h2" className="sr-only">
                  Monthly metrics
                </Typography>
                <IncomeCard income={viewModel.income} incomeTrend={viewModel.incomeTrend} />
                <ExpenseCard
                  expenses={viewModel.expenses}
                  expenseFixed={viewModel.expenseFixed}
                  expenseVariable={viewModel.expenseVariable}
                  expenseTrend={viewModel.expenseTrend}
                />
                <SavingsCard
                  savings={viewModel.savings}
                  savingsRate={viewModel.savingsRate}
                  savingsTrend={viewModel.savingsTrend}
                />
                <ForecastCard
                  forecastAmount={viewModel.forecastAmount}
                  forecastConfidence={viewModel.forecastConfidence}
                  forecastMethod={viewModel.forecastMethod}
                />
              </section>
            </StaggerItem>

            <StaggerItem>
              <TrendCharts points={viewModel.chartPoints} />
            </StaggerItem>

            <StaggerItem>
              <InsightsWidget month={month} />
            </StaggerItem>

            <StaggerItem>
              <SavingsGoalsWidget month={month} />
            </StaggerItem>

            <StaggerItem>
              <BudgetWidget summary={data.overview.budgetSummary} />
            </StaggerItem>

            <StaggerItem>
              <CategoryBreakdown items={viewModel.categoryBreakdown} />
            </StaggerItem>
          </StaggerList>
        </FadeIn>
      ) : null}
    </PageShell>
  );
}
