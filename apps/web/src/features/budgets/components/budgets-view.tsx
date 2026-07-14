'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CategoryBudgetStatus } from '@finance/shared';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  PageShell,
  ThemeToggle,
} from '@/components/design-system';
import { buttonVariants } from '@/components/ui/button';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { currentMonthKey, formatMonthLabel } from '@/lib/month';
import { formatMoney, formatPercent } from '@/lib/format-money';
import { Typography } from '@/components/design-system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { fetchBudgetableCategories } from '../api/budgets-api';
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useUpdateBudgetMutation,
} from '../hooks/use-budget-mutations';
import { useMonthlyBudgetSummary } from '../hooks/use-budgets';
import { budgetToFormValues, defaultBudgetFormValues } from '../lib/form-mappers';
import { BudgetCard } from './budget-card';
import { BudgetFormDialog } from './budget-form-dialog';
import { DeleteBudgetDialog } from './delete-budget-dialog';

type DialogState = { mode: 'create' } | { mode: 'edit'; item: CategoryBudgetStatus } | null;
type DeleteState = { id: string; name: string } | null;

export function BudgetsView() {
  const [month, setMonth] = useState(currentMonthKey());
  const { data, isLoading, isError, error, refetch } = useMonthlyBudgetSummary(month);
  const categoriesQuery = useQuery({
    queryKey: ['categories', 'budgetable'],
    queryFn: fetchBudgetableCategories,
  });

  const createBudget = useCreateBudgetMutation(month);
  const updateBudget = useUpdateBudgetMutation(month);
  const deleteBudget = useDeleteBudgetMutation(month);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);

  const budgetedCategoryIds = useMemo(
    () => new Set(data?.categories.map((item) => item.categoryId) ?? []),
    [data?.categories],
  );

  const availableCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((category) => !budgetedCategoryIds.has(category.id)),
    [categoriesQuery.data, budgetedCategoryIds],
  );

  const items = data?.categories ?? [];
  const isMutating = createBudget.isPending || updateBudget.isPending || deleteBudget.isPending;

  return (
    <>
      <PageShell>
        <PageHeader
          title="Budget planning"
          description="Set monthly spending limits per category and track actual vs budget."
          actions={
            <>
              <MonthNavigator
                monthKey={month}
                monthLabel={formatMonthLabel(month)}
                onChange={setMonth}
              />
              <Link
                href={'/dashboard' as Route}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Dashboard
              </Link>
              <Button
                size="sm"
                onClick={() => setDialog({ mode: 'create' })}
                disabled={isMutating || availableCategories.length === 0}
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                New budget
              </Button>
              <ThemeToggle />
            </>
          }
        />

        {isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-xl" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <ErrorState
            title="Could not load budgets"
            message={error?.message ?? 'Something went wrong.'}
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && data && data.categories.length > 0 ? (
          <FadeIn>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Monthly summary</CardTitle>
                <CardDescription>
                  {formatMonthLabel(month)} totals across all budgets
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Budget
                  </Typography>
                  <Typography variant="h3" className="tabular-nums">
                    {formatMoney(data.totalBudget)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Actual
                  </Typography>
                  <Typography variant="h3" className="tabular-nums">
                    {formatMoney(data.totalActual)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Remaining
                  </Typography>
                  <Typography variant="h3" className="tabular-nums">
                    {formatMoney(data.totalRemaining)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" className="text-muted-foreground">
                    Used
                  </Typography>
                  <Typography variant="h3" className="tabular-nums">
                    {formatPercent(data.totalUsedPct, 0)}
                  </Typography>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((item) => (
                <BudgetCard
                  key={item.id}
                  item={item}
                  onEdit={() => setDialog({ mode: 'edit', item })}
                  onDelete={() => setDeleteTarget({ id: item.id, name: item.categoryName })}
                />
              ))}
            </div>
          </FadeIn>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <EmptyState
            title="No budgets for this month"
            description={
              availableCategories.length === 0
                ? 'Create variable expense categories first, then set monthly limits here.'
                : 'Add your first category budget to track spending against limits.'
            }
            action={
              availableCategories.length > 0
                ? { label: 'Create budget', onClick: () => setDialog({ mode: 'create' }) }
                : undefined
            }
          />
        ) : null}
      </PageShell>

      <BudgetFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === 'edit' ? 'Edit budget limit' : 'Create category budget'}
        defaultValues={
          dialog?.mode === 'edit'
            ? budgetToFormValues(dialog.item, month)
            : defaultBudgetFormValues(month)
        }
        categories={dialog?.mode === 'edit' ? [] : availableCategories}
        submitLabel={dialog?.mode === 'edit' ? 'Save changes' : 'Create budget'}
        isEdit={dialog?.mode === 'edit'}
        onSubmit={async (values) => {
          if (dialog?.mode === 'edit') {
            await updateBudget.mutateAsync({
              id: dialog.item.id,
              limitAmount: values.limitAmount,
            });
          } else {
            await createBudget.mutateAsync(values);
          }
        }}
      />

      <DeleteBudgetDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        categoryName={deleteTarget?.name ?? ''}
        isPending={deleteBudget.isPending}
        onConfirm={async () => {
          if (deleteTarget) await deleteBudget.mutateAsync(deleteTarget.id);
        }}
      />
    </>
  );
}
