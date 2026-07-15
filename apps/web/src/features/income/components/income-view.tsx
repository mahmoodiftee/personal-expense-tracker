'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { type ExtraIncome, type IncomeSource } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EmptyState,
  ErrorState,
  FadeIn,
  PageHeader,
  PageShell,
  Typography,
} from '@/components/design-system';
import { buttonVariants } from '@/components/ui/button';
import { DeleteExpenseDialog } from '@/features/expenses/components/delete-expense-dialog';
import { ExpenseListRow } from '@/features/expenses/components/expense-list-row';
import { MonthNavigator } from '@/features/dashboard/components/month-navigator';
import { formatMoney } from '@/lib/format-money';
import { currentMonthKey, formatMonthLabel } from '@/lib/month';

import { extraIncomeToFormValues, fixedIncomeToFormValues } from '../lib/form-mappers';
import {
  useCreateExtraIncomeMutation,
  useCreateFixedIncomeMutation,
  useDeleteExtraIncomeMutation,
  useDeleteFixedIncomeMutation,
  useUpdateExtraIncomeMutation,
  useUpdateFixedIncomeMutation,
} from '../hooks/use-income-mutations';
import { useExtraIncomeList, useFixedIncomeList } from '../hooks/use-income-queries';
import type { IncomeTab } from '../types';
import { ExtraIncomeForm } from './extra-income-form';
import { FixedIncomeForm } from './fixed-income-form';
import { ExtraIncomeFormDialog, FixedIncomeFormDialog } from './income-form-dialog';

type DeleteTarget =
  { kind: 'extra'; id: string; name: string } | { kind: 'fixed'; id: string; name: string } | null;

export function IncomeView() {
  const [tab, setTab] = useState<IncomeTab>('fixed');
  const [month, setMonth] = useState(currentMonthKey());
  const [editExtra, setEditExtra] = useState<ExtraIncome | null>(null);
  const [editFixed, setEditFixed] = useState<IncomeSource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const fixedQuery = useFixedIncomeList();
  const extraQuery = useExtraIncomeList(month);

  const createExtra = useCreateExtraIncomeMutation(month);
  const updateExtra = useUpdateExtraIncomeMutation(month);
  const deleteExtra = useDeleteExtraIncomeMutation(month);
  const createFixed = useCreateFixedIncomeMutation();
  const updateFixed = useUpdateFixedIncomeMutation();
  const deleteFixed = useDeleteFixedIncomeMutation();

  const isLoading = tab === 'extra' ? extraQuery.isLoading : fixedQuery.isLoading;
  const isError = tab === 'extra' ? extraQuery.isError : fixedQuery.isError;
  const error = tab === 'extra' ? extraQuery.error : fixedQuery.error;
  const refetch = tab === 'extra' ? extraQuery.refetch : fixedQuery.refetch;

  const fixedItems = fixedQuery.data ?? [];
  const extraItems = extraQuery.data ?? [];

  const isMutating =
    createExtra.isPending ||
    updateExtra.isPending ||
    deleteExtra.isPending ||
    createFixed.isPending ||
    updateFixed.isPending ||
    deleteFixed.isPending;

  type ListRow = {
    id: string;
    title: string;
    subtitle: string;
    amount: string;
    raw: ExtraIncome | IncomeSource;
  };

  const listContent: ListRow[] = useMemo(() => {
    if (tab === 'extra') {
      return extraItems.map((item) => ({
        id: item.id,
        title: item.description,
        subtitle: new Date(item.occurredAt).toLocaleDateString(),
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
  }, [tab, extraItems, fixedItems]);

  return (
    <>
      <PageShell>
        <PageHeader
          title="Income management"
          description="Set up recurring income and add one-off earnings for the current budget month."
          actions={
            <>
              {tab === 'extra' ? (
                <MonthNavigator
                  monthKey={month}
                  monthLabel={formatMonthLabel(month)}
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

        <div
          className="flex gap-2 rounded-lg border border-border bg-card p-1"
          role="tablist"
          aria-label="Income type"
        >
          {(['fixed', 'extra'] as const).map((value) => (
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
              {value === 'fixed' ? 'Fixed income' : 'Extra income'}
            </Button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {tab === 'extra'
                  ? `Add extra income · ${formatMonthLabel(month)}`
                  : 'Add fixed income'}
              </CardTitle>
              <CardDescription>
                {tab === 'extra'
                  ? "Bonuses and one-off payments count toward this month's totals."
                  : 'Recurring sources like salary that apply every month.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tab === 'extra' ? (
                <ExtraIncomeForm
                  key={month}
                  monthKey={month}
                  onSubmit={async (values) => {
                    await createExtra.mutateAsync(values);
                  }}
                />
              ) : (
                <FixedIncomeForm
                  onSubmit={async (values) => {
                    await createFixed.mutateAsync(values);
                  }}
                />
              )}
            </CardContent>
          </Card>

          <section aria-labelledby="income-list-heading" className="space-y-3">
            <Typography id="income-list-heading" variant="h2">
              {tab === 'extra'
                ? `Extra income · ${formatMonthLabel(month)}`
                : 'Fixed income sources'}
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
                message={error?.message ?? 'Could not load income.'}
                onRetry={() => refetch()}
              />
            ) : null}

            {!isLoading && !isError && listContent.length === 0 ? (
              <EmptyState
                title={tab === 'extra' ? 'No extra income this month' : 'No fixed income yet'}
                description={
                  tab === 'extra'
                    ? 'Add a bonus or one-off payment using the form.'
                    : 'Add your salary or other recurring income sources.'
                }
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
                          if (tab === 'extra') {
                            setEditExtra(item.raw as ExtraIncome);
                          } else {
                            setEditFixed(item.raw as IncomeSource);
                          }
                        }}
                        onDelete={() =>
                          setDeleteTarget({
                            kind: tab === 'extra' ? 'extra' : 'fixed',
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
      </PageShell>

      <ExtraIncomeFormDialog
        open={Boolean(editExtra)}
        onOpenChange={(open) => !open && setEditExtra(null)}
        monthKey={month}
        title="Edit extra income"
        submitLabel="Update extra income"
        defaultValues={editExtra ? extraIncomeToFormValues(editExtra) : undefined}
        onSubmit={async (values) => {
          if (!editExtra) return;
          await updateExtra.mutateAsync({ id: editExtra.id, values });
        }}
      />

      <FixedIncomeFormDialog
        open={Boolean(editFixed)}
        onOpenChange={(open) => !open && setEditFixed(null)}
        title="Edit fixed income"
        submitLabel="Update income source"
        defaultValues={editFixed ? fixedIncomeToFormValues(editFixed) : undefined}
        onSubmit={async (values) => {
          if (!editFixed) return;
          await updateFixed.mutateAsync({ id: editFixed.id, values });
        }}
      />

      <DeleteExpenseDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete income?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This action cannot be undone.`
            : ''
        }
        onConfirm={async () => {
          if (!deleteTarget) return;
          if (deleteTarget.kind === 'extra') {
            await deleteExtra.mutateAsync(deleteTarget.id);
          } else {
            await deleteFixed.mutateAsync(deleteTarget.id);
          }
        }}
      />
    </>
  );
}
