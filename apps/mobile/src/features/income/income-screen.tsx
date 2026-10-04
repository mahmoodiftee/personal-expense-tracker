import {
  currentMonthKey,
  defaultExtraIncomeFormValues,
  defaultFixedIncomeFormValues,
  extraIncomeFormSchema,
  extraIncomeToFormValues,
  fixedIncomeFormSchema,
  fixedIncomeToFormValues,
  formatMoney,
  useCreateExtraIncomeMutation,
  useCreateFixedIncomeMutation,
  useDeleteExtraIncomeMutation,
  useDeleteFixedIncomeMutation,
  useExtraIncomeList,
  useFixedIncomeList,
  useUpdateExtraIncomeMutation,
  useUpdateFixedIncomeMutation,
  type ExtraIncomeFormValues,
  type FixedIncomeFormValues,
} from '@finance/client';
import type { ExtraIncome, IncomeSource, MonthKey } from '@finance/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import {
  EmptyState,
  ErrorState,
  MonthNavigator,
  PageShell,
  Typography,
} from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';
import { confirmDelete, showError } from '@/lib/alerts';

type Tab = 'fixed' | 'extra';
type Editor =
  | { mode: 'create'; kind: Tab }
  | { mode: 'edit'; kind: 'fixed'; item: IncomeSource }
  | { mode: 'edit'; kind: 'extra'; item: ExtraIncome }
  | null;

export function IncomeScreen() {
  const [tab, setTab] = useState<Tab>('fixed');
  const [month, setMonth] = useState<MonthKey>(currentMonthKey());
  const [editor, setEditor] = useState<Editor>(null);

  const fixedQuery = useFixedIncomeList();
  const extraQuery = useExtraIncomeList(month);
  const activeQuery = tab === 'fixed' ? fixedQuery : extraQuery;

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
          <Typography variant="h1">Income</Typography>
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
          { value: 'fixed', label: 'Sources' },
          { value: 'extra', label: 'Extra' },
        ]}
      />

      {tab === 'extra' ? <MonthNavigator monthKey={month} onChange={setMonth} /> : null}

      {editor ? (
        editor.kind === 'fixed' ? (
          <FixedIncomeEditor
            initial={
              editor.mode === 'edit'
                ? fixedIncomeToFormValues(editor.item)
                : defaultFixedIncomeFormValues()
            }
            editId={editor.mode === 'edit' ? editor.item.id : undefined}
            onClose={() => setEditor(null)}
          />
        ) : (
          <ExtraIncomeEditor
            month={month}
            initial={
              editor.mode === 'edit'
                ? extraIncomeToFormValues(editor.item)
                : defaultExtraIncomeFormValues(month)
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
          title="Could not load income"
          message={activeQuery.error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void activeQuery.refetch();
          }}
        />
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && !editor && tab === 'fixed' ? (
        <FixedIncomeList
          items={fixedQuery.data ?? []}
          onEdit={(item) => setEditor({ mode: 'edit', kind: 'fixed', item })}
        />
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError && !editor && tab === 'extra' ? (
        <ExtraIncomeList
          month={month}
          items={extraQuery.data ?? []}
          onEdit={(item) => setEditor({ mode: 'edit', kind: 'extra', item })}
        />
      ) : null}
    </PageShell>
  );
}

function FixedIncomeList({
  items,
  onEdit,
}: {
  items: IncomeSource[];
  onEdit: (item: IncomeSource) => void;
}) {
  const deleteMutation = useDeleteFixedIncomeMutation();

  if (items.length === 0) {
    return (
      <EmptyState
        title="No income sources"
        description="Add a recurring salary or freelance source."
      />
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
                  Due day {item.dueDay} · {item.status}
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
                  confirmDelete('Delete income source?', item.name, () => {
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

function ExtraIncomeList({
  month,
  items,
  onEdit,
}: {
  month: string;
  items: ExtraIncome[];
  onEdit: (item: ExtraIncome) => void;
}) {
  const deleteMutation = useDeleteExtraIncomeMutation(month);

  if (items.length === 0) {
    return <EmptyState title="No extra income" description="Add one-off income for this month." />;
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
                  {new Date(item.occurredAt).toLocaleDateString()}
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
                  confirmDelete('Delete extra income?', item.description, () => {
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

function FixedIncomeEditor({
  initial,
  editId,
  onClose,
}: {
  initial: FixedIncomeFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const createMutation = useCreateFixedIncomeMutation();
  const updateMutation = useUpdateFixedIncomeMutation();
  const form = useForm<FixedIncomeFormValues>({
    resolver: zodResolver(fixedIncomeFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: FixedIncomeFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      showError('Could not save income source', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{editId ? 'Edit income source' : 'New income source'}</Typography>
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

function ExtraIncomeEditor({
  month,
  initial,
  editId,
  onClose,
}: {
  month: string;
  initial: ExtraIncomeFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const createMutation = useCreateExtraIncomeMutation(month);
  const updateMutation = useUpdateExtraIncomeMutation(month);
  const form = useForm<ExtraIncomeFormValues>({
    resolver: zodResolver(extraIncomeFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: ExtraIncomeFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      showError('Could not save extra income', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{editId ? 'Edit extra income' : 'New extra income'}</Typography>
        <FormField
          label="Amount"
          value={form.watch('amount')}
          onChangeText={(text) => form.setValue('amount', text, { shouldValidate: true })}
          error={form.formState.errors.amount?.message}
          keyboardType="decimal-pad"
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
