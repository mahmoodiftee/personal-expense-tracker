'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { SavingsGoalFormValues } from '../lib/schemas';
import { SavingsGoalForm } from './savings-goal-form';

type SavingsGoalFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: SavingsGoalFormValues;
  submitLabel?: string;
  onSubmit: (values: SavingsGoalFormValues) => Promise<void>;
};

export function SavingsGoalFormDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  submitLabel,
  onSubmit,
}: SavingsGoalFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <SavingsGoalForm
          key={`${title}-${defaultValues.name}`}
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
