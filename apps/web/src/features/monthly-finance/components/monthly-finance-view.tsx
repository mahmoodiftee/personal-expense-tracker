'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { CurrencyCode } from '@finance/shared';
import { useMemo, useState } from 'react';

import { buttonVariants } from '@/components/ui/button';
import {
  Container,
  ErrorState,
  FadeIn,
  PageHeader,
  StaggerItem,
  StaggerList,
  ThemeToggle,
  Typography,
} from '@/components/design-system';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { spacing } from '@/lib/design-tokens';
import { currentMonthKey } from '@/lib/month';
import { cn } from '@/lib/utils';

import { useMonthlyFinance } from '../hooks/use-monthly-finance';
import { useToggleFixedPayment } from '../hooks/use-toggle-fixed-payment';
import {
  useCreateVariableExpense,
  useDeleteVariableExpense,
} from '../hooks/use-variable-expense-actions';
import { mapMonthlyFinanceToViewModel } from '../lib/map-view-model';
import { FixedExpensesSection } from './fixed-expenses-section';
import { MonthlySummaryBar } from './monthly-summary-bar';
import { VariableExpensesSection } from './variable-expenses-section';

export function MonthlyFinanceView() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError, error, refetch, isFetching } = useMonthlyFinance(month);
  const togglePayment = useToggleFixedPayment(month);
  const createVariable = useCreateVariableExpense(month);
  const deleteVariable = useDeleteVariableExpense(month);

  const viewModel = useMemo(
    () => (data ? mapMonthlyFinanceToViewModel(data.fixed, data.variable) : null),
    [data],
  );

  const isMutating =
    togglePayment.isPending || createVariable.isPending || deleteVariable.isPending;

  const handleToggle = (expenseId: string, isPaid: boolean) => {
    togglePayment.mutate({ expenseId, isPaid });
  };

  return (
    <main className={cn('min-h-screen pb-24 md:pb-8', spacing.pageY)}>
      <Container className={spacing.section}>
        <PageHeader
          title="Monthly finance"
          description="Manage fixed bill payments and variable spending with live totals."
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
              <ThemeToggle />
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
                  currency={(viewModel?.currency ?? 'USD') as CurrencyCode}
                  monthKey={month}
                  isLoading={isLoading}
                  isPending={isMutating}
                  onAdd={(input) => createVariable.mutate(input)}
                  onDelete={(id) => deleteVariable.mutate(id)}
                />
              </StaggerItem>
            </StaggerList>
          </FadeIn>
        ) : null}
      </Container>

      {viewModel ? (
        <div className="md:hidden">
          <MonthlySummaryBar summary={viewModel.summary} />
        </div>
      ) : null}
    </main>
  );
}
