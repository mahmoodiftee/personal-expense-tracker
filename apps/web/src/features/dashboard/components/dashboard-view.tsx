'use client';

import type { Route } from 'next';

import {
  EmptyState,
  ErrorState,
  FadeIn,
  PageShell,
  StatCardSkeleton,
  Typography,
} from '@/components/design-system';
import { Skeleton } from '@/components/ui/skeleton';
import { currentMonthKey } from '@/lib/month';
import { useState } from 'react';

import { useDashboard } from '../hooks/use-dashboard';
import { mapDashboardToViewModel } from '../lib/map-view-model';
import { CashFlowCard } from './cash-flow-card';
import { DashboardGreeting } from './dashboard-greeting';
import { ExpenseCard } from './expense-card';
import { ForecastCard } from './forecast-card';
import { IncomeCard } from './income-card';
import { CategoryBreakdown } from './lazy-charts';
import { MonthNavigator } from './month-navigator';
import { QuickActionsCard } from './quick-actions-card';
import { SavingsCard } from './savings-card';
import { SavingsHeroCard } from './savings-hero-card';
import { BudgetWidget } from '@/features/budgets/components/budget-widget';
import { InsightsWidget } from '@/features/insights/components/insights-widget';
import { LoanSummaryCard } from '@/features/loans/components/loan-summary-card';
import { SavingsGoalsWidget } from '@/features/savings-goals/components/savings-goals-widget';

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
      <DashboardGreeting
        actions={
          viewModel ? (
            <MonthNavigator
              monthKey={viewModel.monthKey}
              monthLabel={viewModel.monthLabel}
              onChange={setMonth}
            />
          ) : null
        }
      />

      {isFetching && !isLoading ? (
        <Typography variant="caption" className="text-muted-foreground" aria-live="polite">
          Updating…
        </Typography>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]" aria-busy="true">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
              <Skeleton className="h-56 rounded-card" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StatCardSkeleton key={i} />
                ))}
              </div>
            </div>
            <Skeleton className="h-80 rounded-card" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-52 rounded-card" />
            <Skeleton className="h-44 rounded-card" />
          </div>
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-4">
              <section
                aria-labelledby="metrics-heading"
                className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
              >
                <Typography id="metrics-heading" variant="h2" className="sr-only">
                  Monthly metrics
                </Typography>

                <SavingsHeroCard
                  month={month}
                  savings={viewModel.savings}
                  savingsRate={viewModel.savingsRate}
                />

                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
              </section>

              <CashFlowCard points={viewModel.chartPoints} />

              <BudgetWidget summary={data.overview.budgetSummary} />

              <CategoryBreakdown items={viewModel.categoryBreakdown} />
            </div>

            <aside aria-label="Account overview" className="min-w-0 space-y-4">
              <LoanSummaryCard month={month} />
              <QuickActionsCard />
              <SavingsGoalsWidget month={month} />
              <InsightsWidget month={month} />
            </aside>
          </div>
        </FadeIn>
      ) : null}
    </PageShell>
  );
}
