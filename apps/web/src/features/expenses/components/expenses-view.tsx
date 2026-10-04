'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { type FixedExpense, type VariableExpense } from '@finance/shared';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState, FadeIn, PageHeader, PageShell } from '@/components/design-system';
import { buttonVariants } from '@/components/ui/button';
import { formatMoney } from '@/lib/format-money';

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
    <>
      <PageShell>
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
            </>
          }
        />

        <div
          className="inline-flex w-full max-w-md items-center gap-1 rounded-full bg-muted p-1"
          role="tablist"
          aria-label="Expense type"
        >
          {(['variable', 'fixed'] as const).map((value) => {
            const isActive = tab === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(value)}
                className={`flex-1 rounded-full px-3.5 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? 'bg-card text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle id="expense-list-heading">
                {tab === 'variable' ? 'Variable expenses' : 'Fixed expenses'}
              </CardTitle>
              <CardDescription>
                {listContent.length} {listContent.length === 1 ? 'item' : 'items'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="space-y-2" aria-busy="true">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full rounded-2xl" />
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
                  <ul className="space-y-2" aria-labelledby="expense-list-heading">
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
            </CardContent>
          </Card>
        </div>
      </PageShell>

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
    </>
  );
}
