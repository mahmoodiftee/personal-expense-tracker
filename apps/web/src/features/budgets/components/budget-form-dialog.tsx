'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Category } from '@finance/shared';

import type { BudgetFormValues } from '../lib/schemas';
import { BudgetForm } from './budget-form';

type BudgetFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  defaultValues: BudgetFormValues;
  categories: Category[];
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
};

export function BudgetFormDialog({
  open,
  onOpenChange,
  title,
  defaultValues,
  categories,
  submitLabel,
  isEdit,
  onSubmit,
}: BudgetFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <BudgetForm
          key={`${title}-${defaultValues.categoryId}-${defaultValues.limitAmount}`}
          defaultValues={defaultValues}
          categories={categories}
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
