'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { CurrencyCode } from '@finance/shared';
import { useMemo, useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  ErrorState,
  FadeIn,
  PageHeader,
  PageShell,
  StaggerItem,
  StaggerList,
  Typography,
} from '@/components/design-system';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { APP_CURRENCY } from '@/lib/currency-config';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { currentMonthKey } from '@/lib/month';

import { useMonthlyFinance } from '../hooks/use-monthly-finance';
import { useToggleFixedPayment } from '../hooks/use-toggle-fixed-payment';
import { useDeleteVariableExpense } from '../hooks/use-variable-expense-actions';
import { mapMonthlyFinanceToViewModel } from '../lib/map-view-model';
import { FixedExpensesSection } from './fixed-expenses-section';
import { MonthlySummaryBar } from './monthly-summary-bar';
import { VariableExpensesSection } from './variable-expenses-section';

export function MonthlyFinanceView() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isFetching } = useMonthlyFinance(month);
  const togglePayment = useToggleFixedPayment(month);
  const deleteVariable = useDeleteVariableExpense(month);

  const viewModel = useMemo(
    () => (data ? mapMonthlyFinanceToViewModel(data.fixed, data.variable, data.income) : null),
    [data],
  );

  const isMutating = togglePayment.isPending || deleteVariable.isPending;

  const handleToggle = (expenseId: string, isPaid: boolean) => {
    togglePayment.mutate({ expenseId, isPaid });
  };

  return (
    <PageShell
      className="pb-28 md:pb-0"
      footer={
        viewModel ? (
          <div
            className={cn(
              'sticky bottom-0 z-10 border-t border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 md:hidden',
            )}
          >
            <MonthlySummaryBar summary={viewModel.summary} />
          </div>
        ) : null
      }
    >
      <PageHeader
        title="Monthly finance"
        description="Mark fixed bills as paid and track how much income you have left this month."
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
              href={'/dashboard' as Route}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              Dashboard
            </Link>
          </>
        }
      />

      {isFetching && !isLoading ? (
        <Typography variant="caption" className="text-muted-foreground" aria-live="polite">
          Updating…
        </Typography>
      ) : null}

      {isError ? (
        <ErrorState
          title="Could not load monthly finance"
          message={error?.message ?? 'Something went wrong while fetching your data.'}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isError ? (
        <FadeIn>
          <StaggerList className={spacing.section}>
            {viewModel ? (
              <StaggerItem>
                <MonthlySummaryBar summary={viewModel.summary} className="hidden md:block" />
              </StaggerItem>
            ) : null}

            <StaggerItem>
              <FixedExpensesSection
                items={viewModel?.fixedItems ?? []}
                isLoading={isLoading}
                isPending={isMutating}
                onToggle={handleToggle}
              />
            </StaggerItem>

            <StaggerItem>
              <VariableExpensesSection
                items={viewModel?.variableItems ?? []}
                rawItems={data?.variable ?? []}
                currency={(viewModel?.currency ?? APP_CURRENCY) as CurrencyCode}
                isLoading={isLoading}
                isPending={isMutating}
                onDelete={(id) => deleteVariable.mutate(id)}
              />
            </StaggerItem>
          </StaggerList>
        </FadeIn>
      ) : null}
    </PageShell>
  );
}
