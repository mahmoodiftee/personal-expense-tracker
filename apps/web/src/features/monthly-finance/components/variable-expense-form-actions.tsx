'use client';

import type { CurrencyCode, VariableExpense } from '@finance/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ExpenseFormDialog } from '@/features/expenses/components/expense-form-dialog';
import {
  useCreateVariableExpenseMutation,
  useUpdateVariableExpenseMutation,
} from '@/features/expenses/hooks/use-expense-mutations';
import { variableExpenseToFormValues } from '@/features/expenses/lib/form-mappers';

type VariableExpenseFormActionsProps = {
  currency: CurrencyCode;
  editingExpense?: VariableExpense | null;
  onEditClose?: () => void;
};

export function VariableExpenseFormActions({
  editingExpense,
  onEditClose,
}: VariableExpenseFormActionsProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const createMutation = useCreateVariableExpenseMutation();
  const updateMutation = useUpdateVariableExpenseMutation();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setCreateOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add variable expense
      </Button>

      <ExpenseFormDialog
        kind="variable"
        open={createOpen}
        onOpenChange={setCreateOpen}
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
