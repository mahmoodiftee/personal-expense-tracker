'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import type { SavingsGoalWithProgress } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState, ErrorState, FadeIn, PageHeader, PageShell } from '@/components/design-system';
import { buttonVariants } from '@/components/ui/button';

import {
  useCreateSavingsGoalMutation,
  useDeleteSavingsGoalMutation,
  useUpdateSavingsGoalMutation,
} from '../hooks/use-savings-goal-mutations';
import { useSavingsGoalsOverview } from '../hooks/use-savings-goals';
import { defaultGoalFormValues, goalToFormValues } from '../lib/form-mappers';
import { DeleteSavingsGoalDialog } from './delete-savings-goal-dialog';
import { SavingsGoalCard } from './savings-goal-card';
import { SavingsGoalFormDialog } from './savings-goal-form-dialog';

type DialogState = { mode: 'create' } | { mode: 'edit'; goal: SavingsGoalWithProgress } | null;

type DeleteState = { id: string; name: string } | null;

export function SavingsGoalsView() {
  const { data, isLoading, isError, error, refetch } = useSavingsGoalsOverview();
  const createGoal = useCreateSavingsGoalMutation();
  const updateGoal = useUpdateSavingsGoalMutation();
  const deleteGoal = useDeleteSavingsGoalMutation();

  const [dialog, setDialog] = useState<DialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);

  const goals = data?.goals ?? [];
  const isMutating = createGoal.isPending || updateGoal.isPending || deleteGoal.isPending;

  return (
    <>
      <PageShell>
        <PageHeader
          title="Savings goals"
          description="Set targets, track progress, and estimate when you will reach each goal."
          actions={
            <>
              <Link
                href={'/dashboard' as Route}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Dashboard
              </Link>
              <Button size="sm" onClick={() => setDialog({ mode: 'create' })} disabled={isMutating}>
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                New goal
              </Button>
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
            title="Could not load savings goals"
            message={error?.message ?? 'Something went wrong.'}
            onRetry={() => refetch()}
          />
        ) : null}

        {!isLoading && !isError && goals.length === 0 ? (
          <EmptyState
            title="No savings goals yet"
            description="Create your first goal to start tracking progress and estimated completion dates."
            action={{ label: 'Create goal', onClick: () => setDialog({ mode: 'create' }) }}
          />
        ) : null}

        {!isLoading && !isError && goals.length > 0 ? (
          <FadeIn>
            <div className="grid gap-4 lg:grid-cols-2">
              {goals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setDialog({ mode: 'edit', goal })}
                  onDelete={() => setDeleteTarget({ id: goal.id, name: goal.name })}
                />
              ))}
            </div>
          </FadeIn>
        ) : null}
      </PageShell>

      <SavingsGoalFormDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        title={dialog?.mode === 'edit' ? 'Edit savings goal' : 'Create savings goal'}
        defaultValues={
          dialog?.mode === 'edit' ? goalToFormValues(dialog.goal) : defaultGoalFormValues()
        }
        submitLabel={dialog?.mode === 'edit' ? 'Save changes' : 'Create goal'}
        onSubmit={async (values) => {
          if (dialog?.mode === 'edit') {
            await updateGoal.mutateAsync({ id: dialog.goal.id, values });
          } else {
            await createGoal.mutateAsync(values);
          }
        }}
      />

      <DeleteSavingsGoalDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        goalName={deleteTarget?.name ?? ''}
        isPending={deleteGoal.isPending}
        onConfirm={async () => {
          if (deleteTarget) await deleteGoal.mutateAsync(deleteTarget.id);
        }}
      />
    </>
  );
}
