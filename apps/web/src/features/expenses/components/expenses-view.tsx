'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { type FixedExpense, type VariableExpense } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Container,
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  ThemeToggle,
  Typography,
} from '@/components/design-system';
import { buttonVariants } from '@/components/ui/button';
import { spacing } from '@/lib/design-tokens';
import { formatMoney } from '@/lib/format-money';
import { cn } from '@/lib/utils';

import { fixedExpenseToFormValues, variableExpenseToFormValues } from '../lib/form-mappers';
import {
  useCreateFixedExpenseMutation,
  useCreateVariableExpenseMutation,
  useDeleteFixedExpenseMutation,
  useDeleteVariableExpenseMutation,
  useUpdateFixedExpenseMutation,
  useUpdateVariableExpenseMutation,
} from '../hooks/use-expense-mutations';
import { useFixedExpensesList, useVariableExpensesList } from '../hooks/use-expense-queries';
import type { ExpenseTab } from '../types';
import { DeleteExpenseDialog } from './delete-expense-dialog';
import { ExpenseFormDialog } from './expense-form-dialog';
import { ExpenseListRow } from './expense-list-row';
import { FixedExpenseForm } from './fixed-expense-form';
import { VariableExpenseForm } from './variable-expense-form';

type DeleteTarget =
  | { kind: 'variable'; id: string; name: string }
  | { kind: 'fixed'; id: string; name: string }
  | null;

export function ExpensesView() {
  const [tab, setTab] = useState<ExpenseTab>('variable');
  const [editVariable, setEditVariable] = useState<VariableExpense | null>(null);
  const [editFixed, setEditFixed] = useState<FixedExpense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const fixedQuery = useFixedExpensesList();
  const variableQuery = useVariableExpensesList();

  const createVariable = useCreateVariableExpenseMutation();
  const updateVariable = useUpdateVariableExpenseMutation();
  const deleteVariable = useDeleteVariableExpenseMutation();
  const createFixed = useCreateFixedExpenseMutation();
  const updateFixed = useUpdateFixedExpenseMutation();
  const deleteFixed = useDeleteFixedExpenseMutation();

  const isLoading = tab === 'variable' ? variableQuery.isLoading : fixedQuery.isLoading;
  const isError = tab === 'variable' ? variableQuery.isError : fixedQuery.isError;
  const error = tab === 'variable' ? variableQuery.error : fixedQuery.error;
  const refetch = tab === 'variable' ? variableQuery.refetch : fixedQuery.refetch;

  const variableItems = variableQuery.data ?? [];
  const fixedItems = fixedQuery.data ?? [];

  const isMutating =
    createVariable.isPending ||
    updateVariable.isPending ||
    deleteVariable.isPending ||
    createFixed.isPending ||
    updateFixed.isPending ||
    deleteFixed.isPending;

  type ListRow = {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    raw: VariableExpense | FixedExpense;
  };

  const listContent: ListRow[] = useMemo(() => {
    if (tab === 'variable') {
      return variableItems.map((item) => ({
        id: item.id,
        title: item.description,
        subtitle: `${item.category.name} · ${new Date(item.occurredAt).toLocaleDateString()}`,
        amount: formatMoney(item.amount),
        raw: item,
      }));
    }

    return fixedItems.map((item) => ({
      id: item.id,
      title: item.name,
      subtitle: `Due day ${item.dueDay} · ${item.cadence} · ${item.status}`,
      amount: formatMoney(item.amount),
      raw: item,
    }));
  }, [tab, variableItems, fixedItems]);

  return (
    <main className={cn('min-h-screen', spacing.pageY)}>
      <Container className={spacing.section}>
        <PageHeader
          title="Expense management"
          description="Create, edit, and delete fixed and variable expenses with validated forms."
          actions={
            <>
              <Link
                href={'/finance' as Route}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Monthly finance
              </Link>
              <ThemeToggle />
            </>
          }
        />

        <div
          className="flex gap-2 rounded-lg border border-border bg-card p-1"
          role="tablist"
          aria-label="Expense type"
        >
          {(['variable', 'fixed'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={tab === value ? 'default' : 'ghost'}
              className="flex-1 capitalize"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create {tab} expense
              </CardTitle>
              <CardDescription>Client-side validation runs before the API request.</CardDescription>
            </CardHeader>
            <CardContent>
              {tab === 'variable' ? (
                <VariableExpenseForm
                  onSubmit={async (values) => {
                    await createVariable.mutateAsync(values);
                  }}
                />
              ) : (
                <FixedExpenseForm
                  onSubmit={async (values) => {
                    await createFixed.mutateAsync(values);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <section aria-labelledby="expense-list-heading" className="space-y-3">
            <Typography id="expense-list-heading" variant="h2">
              {tab === 'variable' ? 'Variable expenses' : 'Fixed expenses'}
            </Typography>

            {isLoading ? (
              <div className="space-y-2" aria-busy="true">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : null}

            {isError ? (
              <ErrorState
                message={error?.message ?? 'Could not load expenses.'}
                onRetry={() => refetch()}
              />
            ) : null}

            {!isLoading && !isError && listContent.length === 0 ? (
              <EmptyState
                title={`No ${tab} expenses yet`}
                description="Use the form to create your first expense."
              />
            ) : null}

            {!isLoading && !isError && listContent.length > 0 ? (
              <FadeIn>
                <ul className="space-y-2">
                  {listContent.map((item) => (
                    <li key={item.id}>
                      <ExpenseListRow
                        title={item.title}
                        subtitle={item.subtitle}
                        amount={item.amount}
                        disabled={isMutating}
                        onEdit={() => {
                          if (tab === 'variable') {
                            setEditVariable(item.raw as VariableExpense);
                          } else {
                            setEditFixed(item.raw as FixedExpense);
                          }
                        }}
                        onDelete={() =>
                          setDeleteTarget({
                            kind: tab,
                            id: item.id,
                            name: item.title,
                          })
                        }
                      />
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ) : null}
          </section>
        </div>
      </Container>

      <ExpenseFormDialog
        kind="variable"
        open={Boolean(editVariable)}
        onOpenChange={(open) => !open && setEditVariable(null)}
        title="Edit variable expense"
        submitLabel="Update expense"
        defaultValues={editVariable ? variableExpenseToFormValues(editVariable) : undefined}
        onSubmit={async (values) => {
          if (!editVariable) return;
          await updateVariable.mutateAsync({ id: editVariable.id, values });
        }}
      />

      <ExpenseFormDialog
        kind="fixed"
        open={Boolean(editFixed)}
        onOpenChange={(open) => !open && setEditFixed(null)}
        title="Edit fixed expense"
        submitLabel="Update fixed expense"
        isEdit
        defaultValues={editFixed ? fixedExpenseToFormValues(editFixed) : undefined}
        onSubmit={async (values) => {
          if (!editFixed) return;
          await updateFixed.mutateAsync({ id: editFixed.id, values });
        }}
      />

      <DeleteExpenseDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete expense?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This action cannot be undone.`
            : ''
        }
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === 'variable') {
            await deleteVariable.mutateAsync(deleteTarget.id);
          } else {
            await deleteFixed.mutateAsync(deleteTarget.id);
          }
        }}
      />
    </main>
  );
}
