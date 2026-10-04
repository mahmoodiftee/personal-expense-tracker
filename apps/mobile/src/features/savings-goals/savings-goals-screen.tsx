import {
  defaultSavingsGoalFormValues,
  formatMoney,
  formatPercent,
  GOAL_TEMPLATE_OPTIONS,
  savingsGoalFormSchema,
  savingsGoalToFormValues,
  templateLabel,
  useCreateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useSavingsGoalsOverview,
  useUpdateSavingsGoalMutation,
  type SavingsGoalFormValues,
} from '@finance/client';
import type { SavingsGoalWithProgress } from '@finance/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { EmptyState, ErrorState, PageShell, Typography } from '@/components/design-system';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { FormField } from '@/components/ui/form-field';
import { Skeleton } from '@/components/ui/skeleton';
import { confirmDelete, showError } from '@/lib/alerts';

type Editor = { mode: 'create' } | { mode: 'edit'; item: SavingsGoalWithProgress } | null;

export function SavingsGoalsScreen() {
  const [editor, setEditor] = useState<Editor>(null);
  const query = useSavingsGoalsOverview();

  return (
    <PageShell
      safeTop={false}
      refreshing={query.isRefetching}
      onRefresh={() => {
        void query.refetch();
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Typography variant="label">Targets</Typography>
          <Typography variant="h1">Savings goals</Typography>
        </View>
        <Button label="Add" className="px-4 py-2" onPress={() => setEditor({ mode: 'create' })} />
      </View>

      {editor ? (
        <GoalEditor
          initial={
            editor.mode === 'edit'
              ? savingsGoalToFormValues(editor.item)
              : defaultSavingsGoalFormValues()
          }
          editId={editor.mode === 'edit' ? editor.item.id : undefined}
          onClose={() => setEditor(null)}
        />
      ) : null}

      {query.isLoading ? (
        <View className="gap-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </View>
      ) : null}

      {query.isError ? (
        <ErrorState
          title="Could not load goals"
          message={query.error?.message ?? 'Something went wrong.'}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : null}

      {!query.isLoading && !query.isError && !editor ? (
        (query.data?.goals.length ?? 0) === 0 ? (
          <EmptyState
            title="No savings goals"
            description="Create a goal to track progress toward a target."
          />
        ) : (
          <View className="gap-2">
            {query.data?.goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onEdit={() => setEditor({ mode: 'edit', item: goal })}
              />
            ))}
          </View>
        )
      ) : null}
    </PageShell>
  );
}

function GoalRow({ goal, onEdit }: { goal: SavingsGoalWithProgress; onEdit: () => void }) {
  const deleteMutation = useDeleteSavingsGoalMutation();

  return (
    <Card>
      <CardContent className="gap-2 py-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Typography variant="body" className="font-semibold">
              {goal.name || templateLabel(goal.template)}
            </Typography>
            <Typography variant="caption">
              {formatMoney(goal.currentAmount)} of {formatMoney(goal.targetAmount)}
            </Typography>
          </View>
          <Typography variant="body" className="font-semibold tabular-nums">
            {formatPercent(goal.progress.progressPct, 0)}
          </Typography>
        </View>
        <View className="h-2 overflow-hidden rounded-full bg-muted">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.min(100, Math.max(0, goal.progress.progressPct))}%` }}
          />
        </View>
        {goal.progress.estimatedCompletionMonth ? (
          <Typography variant="caption">
            ETA {goal.progress.estimatedCompletionMonth}
            {goal.progress.onTrack === false ? ' · Behind target' : ''}
          </Typography>
        ) : null}
        <View className="flex-row gap-2">
          <Button label="Edit" variant="secondary" className="flex-1 py-2" onPress={onEdit} />
          <Button
            label="Delete"
            variant="ghost"
            className="flex-1 py-2"
            labelClassName="text-destructive"
            onPress={() =>
              confirmDelete('Delete goal?', goal.name || templateLabel(goal.template), () => {
                deleteMutation.mutate(goal.id, {
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

function GoalEditor({
  initial,
  editId,
  onClose,
}: {
  initial: SavingsGoalFormValues;
  editId?: string;
  onClose: () => void;
}) {
  const createMutation = useCreateSavingsGoalMutation();
  const updateMutation = useUpdateSavingsGoalMutation();
  const form = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues: initial,
  });

  async function onSubmit(values: SavingsGoalFormValues) {
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      showError('Could not save goal', error);
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{editId ? 'Edit goal' : 'New goal'}</Typography>
        <View className="gap-2">
          <Typography variant="label">Template</Typography>
          <View className="flex-row flex-wrap gap-2">
            {GOAL_TEMPLATE_OPTIONS.map((option) => (
              <Chip
                key={option.template}
                label={option.label}
                selected={form.watch('template') === option.template}
                onPress={() => form.setValue('template', option.template, { shouldValidate: true })}
              />
            ))}
          </View>
        </View>
        <FormField
          label="Name (required for custom)"
          value={form.watch('name') ?? ''}
          onChangeText={(text) => form.setValue('name', text, { shouldValidate: true })}
          error={form.formState.errors.name?.message}
        />
        <FormField
          label="Target amount"
          value={form.watch('targetAmount')}
          onChangeText={(text) => form.setValue('targetAmount', text, { shouldValidate: true })}
          error={form.formState.errors.targetAmount?.message}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Current amount"
          value={form.watch('currentAmount')}
          onChangeText={(text) => form.setValue('currentAmount', text, { shouldValidate: true })}
          error={form.formState.errors.currentAmount?.message}
          keyboardType="decimal-pad"
        />
        <FormField
          label="Target date (YYYY-MM-DD, optional)"
          value={form.watch('targetDate') ?? ''}
          onChangeText={(text) => form.setValue('targetDate', text, { shouldValidate: true })}
          error={form.formState.errors.targetDate?.message}
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
