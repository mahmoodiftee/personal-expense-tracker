'use client';

import type { CurrencyCode, VariableExpense } from '@finance/shared';

import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import {
  useCreateVariableExpenseMutation,
  useUpdateVariableExpenseMutation,
} from '@/features/expenses/hooks/use-expense-mutations';
import { variableExpenseToFormValues } from '@/features/expenses/lib/form-mappers';

type VariableExpenseFormActionsProps = {
  currency: CurrencyCode;
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  editingExpense?: VariableExpense | null;
  onEditClose?: () => void;
};

export function VariableExpenseFormActions({
  createOpen,
  onCreateOpenChange,
  editingExpense,
  onEditClose,
}: VariableExpenseFormActionsProps) {
  const createMutation = useCreateVariableExpenseMutation();
  const updateMutation = useUpdateVariableExpenseMutation();

  return (
    <>
      <ExpenseFormDialog
        kind="variable"
        open={createOpen}
        onOpenChange={onCreateOpenChange}
        title="Add variable expense"
        submitLabel="Create expense"
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
        }}
      />

      <ExpenseFormDialog
        kind="variable"
        open={Boolean(editingExpense)}
        onOpenChange={(open) => {
          if (!open) onEditClose?.();
        }}
        title="Edit variable expense"
        submitLabel="Update expense"
        defaultValues={editingExpense ? variableExpenseToFormValues(editingExpense) : undefined}
        onSubmit={async (values) => {
          if (!editingExpense) return;
          await updateMutation.mutateAsync({ id: editingExpense.id, values });
          onEditClose?.();
        }}
      />
    </>
  );
}
