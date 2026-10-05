import {
  budgetFormSchema,
  currentMonthKey,
  formatMoney,
  formatPercent,
  useBudgetableCategories,
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useMonthlyBudgetSummary,
  useUpdateBudgetMutation,
  type BudgetFormValues,
} from '@finance/client';
import { MoneyMath, type CategoryBudgetStatus, type MonthKey } from '@finance/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  ProgressBar,
  ScreenHeader,
  Typography,
} from '@/components/design-system';
import { DonutChart } from '@/components/charts/donut-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormField } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { confirmDelete, showError } from '@/lib/alerts';

type Editor = { mode: 'create' } | { mode: 'edit'; item: CategoryBudgetStatus } | null;

export function BudgetsScreen() {
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [editor, setEditor] = useState<Editor>(null);
  const query = useMonthlyBudgetSummary(month);
  const categoriesQuery = useBudgetableCategories();

  const summary = query.data;

  return (
    <PageShell
      safeTop={false}
      tabBarInset={false}
      header={
        <ScreenHeader
          title="Budgets"
          right={
            <Button
              label="Add"
              className="px-4 py-2"
              onPress={() => setEditor({ mode: 'create' })}
            />
          }
        />
      }
      refreshing={query.isRefetching}
      onRefresh={() => {
        void query.refetch();
      }}
    >
      <MonthNavigator
        monthKey={month}
        onChange={(next) => {
          setMonth(next);
          setEditor(null);
        }}
      />

      {query.isLoading ? <Skeleton className="h-28 w-full" /> : null}

      {query.isError ? (
        <ErrorState
          title="Could not load budgets"
          message={query.error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : null}

      {summary ? (
        <>
          <Card>
            <CardContent className="gap-1">
              <Typography variant="caption">Total budget</Typography>
              <Typography variant="h2" className="tabular-nums">
                {formatMoney(summary.totalBudget)}
              </Typography>
              <Typography variant="caption">
                Spent {formatMoney(summary.totalActual)} · Remaining{' '}
                {formatMoney(summary.totalRemaining)} · {formatPercent(summary.totalUsedPct, 0)}{' '}
                used
              </Typography>
            </CardContent>
          </Card>
          {summary.categories.length > 0 ? (
            <DonutChart
              title="Budget mix"
              caption="Spent"
              total={formatMoney(summary.totalActual)}
              slices={summary.categories.map((item) => ({
                name: item.categoryName,
                color: item.color,
                total: formatMoney(item.actual),
                sharePct:
                  summary.totalActual.amountMinor > 0
                    ? (item.actual.amountMinor / summary.totalActual.amountMinor) * 100
                    : 0,
              }))}
            />
          ) : null}
        </>
      ) : null}

      {editor ? (
        <BudgetEditor
          month={month}
          categories={categoriesQuery.data ?? []}
          initial={
            editor.mode === 'edit'
              ? {
                  month,
                  categoryId: editor.item.categoryId,
                  limitAmount: MoneyMath.toMajor(editor.item.budget).toFixed(2),
                }
              : { month, categoryId: '', limitAmount: '' }
          }
          editId={editor.mode === 'edit' ? editor.item.id : undefined}
          onClose={() => setEditor(null)}
        />
      ) : null}

      {!query.isLoading && !query.isError && summary && !editor ? (
        summary.categories.length === 0 ? (
          <EmptyState
            title="No budgets yet"
            description="Set a monthly limit for a variable expense category."
          />
        ) : (
          <View className="gap-2">
            {summary.categories.map((item) => (
              <BudgetRow
                key={item.id}
                item={item}
                month={month}
                onEdit={() => setEditor({ mode: 'edit', item })}
              />
            ))}
          </View>
        )
      ) : null}
    </PageShell>
  );
}

function BudgetRow({
  item,
  month,
  onEdit,
}: {
  item: CategoryBudgetStatus;
  month: MonthKey;
  onEdit: () => void;
}) {
  const deleteMutation = useDeleteBudgetMutation(month);

  return (
    <Card>
      <CardContent className="gap-2 py-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Typography variant="body" className="font-semibold">
              {item.categoryName}
            </Typography>
            <Typography variant="caption">
              {formatMoney(item.actual)} of {formatMoney(item.budget)} ·{' '}
              {formatPercent(item.usedPct, 0)}
            </Typography>
          </View>
          <Typography
            variant="body"
            className={`font-semibold tabular-nums ${item.isOverBudget ? 'text-destructive' : ''}`}
          >
            {formatMoney(item.remaining)}
          </Typography>
        </View>
        <ProgressBar value={item.usedPct} color={item.color} />
        <View className="flex-row gap-2">
          <Button label="Edit" variant="secondary" className="flex-1 py-2" onPress={onEdit} />
          <Button
            label="Delete"
            variant="ghost"
            className="flex-1 py-2"
            labelClassName="text-destructive"
            onPress={() =>
              confirmDelete('Delete budget?', item.categoryName, () => {
                deleteMutation.mutate(item.id, {
                  onError: (error) => showError('Delete failed', error),
                });
              })
            }
          />
        </View>
      </CardContent>
    </Card>
  );
}

function BudgetEditor({
  month,
  categories,
  initial,
  editId,
  onClose,
}: {
  month: MonthKey;
  categories: { id: string; name: string }[];
  initial: BudgetFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const createMutation = useCreateBudgetMutation(month);
  const updateMutation = useUpdateBudgetMutation(month);
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: BudgetFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, limitAmount: values.limitAmount });
      } else {
        await createMutation.mutateAsync({ ...values, month });
      }
      onClose();
    } catch (error) {
      showError('Could not save budget', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{editId ? 'Edit budget' : 'New budget'}</Typography>
        {!editId ? (
          <View className="gap-2">
            <Typography variant="label">Category</Typography>
            <View className="flex-row flex-wrap gap-2">
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  selected={form.watch('categoryId') === category.id}
                  onPress={() => form.setValue('categoryId', category.id, { shouldValidate: true })}
                />
              ))}
            </View>
            {form.formState.errors.categoryId?.message ? (
              <Typography variant="caption" className="text-destructive">
                {form.formState.errors.categoryId.message}
              </Typography>
            ) : null}
          </View>
        ) : null}
        <FormField
          label="Monthly limit"
          value={form.watch('limitAmount')}
          onChangeText={(text) => form.setValue('limitAmount', text, { shouldValidate: true })}
          error={form.formState.errors.limitAmount?.message}
          keyboardType="decimal-pad"
        />
        <View className="flex-row gap-2">
          <Button label="Cancel" variant="secondary" className="flex-1" onPress={onClose} />
          <Button
            label={pending ? 'Saving…' : 'Save'}
            className="flex-1"
            disabled={pending}
            onPress={form.handleSubmit(onSubmit)}
          />
        </View>
      </CardContent>
    </Card>
  );
}
