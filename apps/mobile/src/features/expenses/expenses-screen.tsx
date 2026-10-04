import {
  defaultFixedExpenseFormValues,
  defaultVariableExpenseFormValues,
  fixedExpenseFormSchema,
  fixedExpenseToFormValues,
  formatMoney,
  useCreateFixedExpenseMutation,
  useCreateVariableExpenseMutation,
  useDeleteFixedExpenseMutation,
  useDeleteVariableExpenseMutation,
  useFixedExpensesList,
  useUpdateFixedExpenseMutation,
  useUpdateVariableExpenseMutation,
  useVariableCategories,
  useVariableExpensesList,
  variableExpenseFormSchema,
  variableExpenseToFormValues,
  type FixedExpenseFormValues,
  type VariableExpenseFormValues,
} from '@finance/client';
import { PlanSubtype, type FixedExpense, type VariableExpense } from '@finance/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Switch, View } from 'react-native';

import { EmptyState, ErrorState, PageShell, Typography } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormField } from '@/components/ui/form-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { confirmDelete, showError } from '@/lib/alerts';

type Tab = 'variable' | 'fixed';
type Editor =
  | { mode: 'create'; kind: Tab }
  | { mode: 'edit'; kind: 'variable'; item: VariableExpense }
  | { mode: 'edit'; kind: 'fixed'; item: FixedExpense }
  | null;

export function ExpensesScreen() {
  const [tab, setTab] = useState<Tab>('variable');
  const [editor, setEditor] = useState<Editor>(null);

  const variableQuery = useVariableExpensesList();
  const fixedQuery = useFixedExpensesList();
  const activeQuery = tab === 'variable' ? variableQuery : fixedQuery;

  return (
    <PageShell
      safeTop={false}
      refreshing={activeQuery.isRefetching}
      onRefresh={() => {
        void activeQuery.refetch();
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Manage</Typography>
          <Typography variant="h1">Expenses</Typography>
        </View>
        <Button
          label="Add"
          onPress={() => setEditor({ mode: 'create', kind: tab })}
          className="px-4 py-2"
        />
      </View>

      <SegmentedControl
        value={tab}
        onChange={(value) => {
          setTab(value);
          setEditor(null);
        }}
        options={[
          { value: 'variable', label: 'Variable' },
          { value: 'fixed', label: 'Fixed' },
        ]}
      />

      {editor ? (
        editor.kind === 'variable' ? (
          <VariableExpenseEditor
            initial={
              editor.mode === 'edit'
                ? variableExpenseToFormValues(editor.item)
                : defaultVariableExpenseFormValues()
            }
            editId={editor.mode === 'edit' ? editor.item.id : undefined}
            onClose={() => setEditor(null)}
          />
        ) : (
          <FixedExpenseEditor
            initial={
              editor.mode === 'edit'
                ? fixedExpenseToFormValues(editor.item)
                : defaultFixedExpenseFormValues()
            }
            editId={editor.mode === 'edit' ? editor.item.id : undefined}
            onClose={() => setEditor(null)}
          />
        )
      ) : null}

      {activeQuery.isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </View>
      ) : null}

      {activeQuery.isError ? (
        <ErrorState
          title="Could not load expenses"
          message={activeQuery.error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void activeQuery.refetch();
          }}
        />
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && !editor && tab === 'variable' ? (
        <VariableList
          items={variableQuery.data ?? []}
          onEdit={(item) => setEditor({ mode: 'edit', kind: 'variable', item })}
        />
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && !editor && tab === 'fixed' ? (
        <FixedList
          items={fixedQuery.data ?? []}
          onEdit={(item) => setEditor({ mode: 'edit', kind: 'fixed', item })}
        />
      ) : null}
    </PageShell>
  );
}

function VariableList({
  items,
  onEdit,
}: {
  items: VariableExpense[];
  onEdit: (item: VariableExpense) => void;
}) {
  const deleteMutation = useDeleteVariableExpenseMutation();

  if (items.length === 0) {
    return <EmptyState title="No variable expenses" description="Tap Add to capture a spend." />;
  }

  return (
    <View className="gap-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="gap-2 py-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Typography variant="body" className="font-semibold">
                  {item.description}
                </Typography>
                <Typography variant="caption">
                  {item.category.name} · {new Date(item.occurredAt).toLocaleDateString()}
                </Typography>
              </View>
              <Typography variant="body" className="font-semibold tabular-nums">
                {formatMoney(item.amount)}
              </Typography>
            </View>
            <View className="flex-row gap-2">
              <Button
                label="Edit"
                variant="secondary"
                className="flex-1 py-2"
                onPress={() => onEdit(item)}
              />
              <Button
                label="Delete"
                variant="ghost"
                className="flex-1 py-2"
                labelClassName="text-destructive"
                onPress={() =>
                  confirmDelete('Delete expense?', item.description, () => {
                    deleteMutation.mutate(item.id, {
                      onError: (error) => showError('Delete failed', error),
                    });
                  })
                }
              />
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

function FixedList({
  items,
  onEdit,
}: {
  items: FixedExpense[];
  onEdit: (item: FixedExpense) => void;
}) {
  const deleteMutation = useDeleteFixedExpenseMutation();

  if (items.length === 0) {
    return (
      <EmptyState title="No fixed expenses" description="Tap Add to create a recurring bill." />
    );
  }

  return (
    <View className="gap-2">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="gap-2 py-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Typography variant="body" className="font-semibold">
                  {item.name}
                </Typography>
                <Typography variant="caption">
                  Due day {item.dueDay}
                  {item.planSubtype === PlanSubtype.LOAN ? ' · Loan' : ''}
                </Typography>
              </View>
              <Typography variant="body" className="font-semibold tabular-nums">
                {formatMoney(item.amount)}
              </Typography>
            </View>
            <View className="flex-row gap-2">
              <Button
                label="Edit"
                variant="secondary"
                className="flex-1 py-2"
                onPress={() => onEdit(item)}
              />
              <Button
                label="Delete"
                variant="ghost"
                className="flex-1 py-2"
                labelClassName="text-destructive"
                onPress={() =>
                  confirmDelete('Delete fixed expense?', item.name, () => {
                    deleteMutation.mutate(item.id, {
                      onError: (error) => showError('Delete failed', error),
                    });
                  })
                }
              />
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}

function VariableExpenseEditor({
  initial,
  editId,
  onClose,
}: {
  initial: VariableExpenseFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const categoriesQuery = useVariableCategories();
  const createMutation = useCreateVariableExpenseMutation();
  const updateMutation = useUpdateVariableExpenseMutation();
  const form = useForm<VariableExpenseFormValues>({
    resolver: zodResolver(variableExpenseFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: VariableExpenseFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      showError('Could not save expense', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const categories = categoriesQuery.data ?? [];

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">
          {editId ? 'Edit variable expense' : 'New variable expense'}
        </Typography>
        <FormField
          label="Amount"
          value={form.watch('amount')}
          onChangeText={(text) => form.setValue('amount', text, { shouldValidate: true })}
          error={form.formState.errors.amount?.message}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <FormField
          label="Description"
          value={form.watch('description')}
          onChangeText={(text) => form.setValue('description', text, { shouldValidate: true })}
          error={form.formState.errors.description?.message}
        />
        <FormField
          label="Date (YYYY-MM-DD)"
          value={form.watch('occurredOn')}
          onChangeText={(text) => form.setValue('occurredOn', text, { shouldValidate: true })}
          error={form.formState.errors.occurredOn?.message}
          autoCapitalize="none"
        />
        <View className="gap-2">
          <Typography variant="label">Category</Typography>
          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={form.watch('categoryName') === category.name}
                onPress={() => {
                  form.setValue('categoryId', category.id, { shouldValidate: true });
                  form.setValue('categoryName', category.name, { shouldValidate: true });
                }}
              />
            ))}
          </View>
          <FormField
            label="Or type a category"
            value={form.watch('categoryName')}
            onChangeText={(text) => {
              form.setValue('categoryId', undefined);
              form.setValue('categoryName', text, { shouldValidate: true });
            }}
            error={form.formState.errors.categoryName?.message}
          />
        </View>
        <FormField
          label="Notes"
          value={form.watch('notes') ?? ''}
          onChangeText={(text) => form.setValue('notes', text)}
          multiline
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

function FixedExpenseEditor({
  initial,
  editId,
  onClose,
}: {
  initial: FixedExpenseFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const createMutation = useCreateFixedExpenseMutation();
  const updateMutation = useUpdateFixedExpenseMutation();
  const form = useForm<FixedExpenseFormValues>({
    resolver: zodResolver(fixedExpenseFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: FixedExpenseFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      showError('Could not save fixed expense', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;
  const isLoan = form.watch('isLoan');

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{editId ? 'Edit fixed expense' : 'New fixed expense'}</Typography>
        <FormField
          label="Name"
          value={form.watch('name')}
          onChangeText={(text) => form.setValue('name', text, { shouldValidate: true })}
          error={form.formState.errors.name?.message}
        />
        <FormField
          label="Amount"
          value={form.watch('amount')}
          onChangeText={(text) => form.setValue('amount', text, { shouldValidate: true })}
          error={form.formState.errors.amount?.message}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Due day (1-31)"
          value={String(form.watch('dueDay') ?? '')}
          onChangeText={(text) =>
            form.setValue('dueDay', Number.parseInt(text || '0', 10), { shouldValidate: true })
          }
          error={form.formState.errors.dueDay?.message}
          keyboardType="number-pad"
        />
        <FormField
          label="Start month (YYYY-MM)"
          value={form.watch('startMonth')}
          onChangeText={(text) => form.setValue('startMonth', text, { shouldValidate: true })}
          error={form.formState.errors.startMonth?.message}
          autoCapitalize="none"
        />
        <FormField
          label="End month (optional)"
          value={form.watch('endMonth') ?? ''}
          onChangeText={(text) => form.setValue('endMonth', text, { shouldValidate: true })}
          error={form.formState.errors.endMonth?.message}
          autoCapitalize="none"
        />
        <Pressable
          className="flex-row items-center justify-between rounded-2xl bg-muted/50 px-3 py-3"
          onPress={() => form.setValue('isLoan', !isLoan, { shouldValidate: true })}
        >
          <Typography variant="body" className="font-semibold">
            Bank loan
          </Typography>
          <Switch
            value={isLoan}
            onValueChange={(value) => form.setValue('isLoan', value, { shouldValidate: true })}
          />
        </Pressable>
        {isLoan ? (
          <FormField
            label="Principal amount"
            value={form.watch('principalAmount') ?? ''}
            onChangeText={(text) =>
              form.setValue('principalAmount', text, { shouldValidate: true })
            }
            error={form.formState.errors.principalAmount?.message}
            keyboardType="decimal-pad"
          />
        ) : null}
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
