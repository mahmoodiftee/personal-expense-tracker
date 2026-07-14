'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { FixedExpenseFormValues, VariableExpenseFormValues } from '../lib/schemas';
import { FixedExpenseForm } from './fixed-expense-form';
import { VariableExpenseForm } from './variable-expense-form';

export function VariableExpenseFormDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: VariableExpenseFormValues;
  submitLabel?: string;
  onSubmit: (values: VariableExpenseFormValues) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <VariableExpenseForm
          key={defaultValues?.description ?? 'create-variable'}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          onSubmit={async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export function FixedExpenseFormDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  submitLabel,
  isEdit,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues?: FixedExpenseFormValues;
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: FixedExpenseFormValues) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FixedExpenseForm
          key={defaultValues?.name ?? 'create-fixed'}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          isEdit={isEdit}
          onSubmit={async (values) => {
            await onSubmit(values);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/** @deprecated Use VariableExpenseFormDialog or FixedExpenseFormDialog */
export function ExpenseFormDialog(
  props:
    | ({ kind: 'variable' } & React.ComponentProps<typeof VariableExpenseFormDialog>)
    | ({ kind: 'fixed' } & React.ComponentProps<typeof FixedExpenseFormDialog>),
) {
  if (props.kind === 'variable') {
    const { kind: _kind, ...rest } = props;
    return <VariableExpenseFormDialog {...rest} />;
  }
  const { kind: _kind, ...rest } = props;
  return <FixedExpenseFormDialog {...rest} />;
}

export { fixedExpenseToFormValues, variableExpenseToFormValues } from '../lib/form-mappers';
