'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import type { ExtraIncomeFormValues, FixedIncomeFormValues } from '../lib/schemas';
import { ExtraIncomeForm } from './extra-income-form';
import { FixedIncomeForm } from './fixed-income-form';

export function ExtraIncomeFormDialog({
  open,
  onOpenChange,
  monthKey,
  title,
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthKey: string;
  title: string;
  defaultValues?: ExtraIncomeFormValues;
  submitLabel?: string;
  onSubmit: (values: ExtraIncomeFormValues) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ExtraIncomeForm
          key={defaultValues?.description ?? `create-extra-${monthKey}`}
          monthKey={monthKey}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          isEdit
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

export function FixedIncomeFormDialog({
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
  defaultValues?: FixedIncomeFormValues;
  submitLabel?: string;
  onSubmit: (values: FixedIncomeFormValues) => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FixedIncomeForm
          key={defaultValues?.name ?? 'create-fixed'}
          defaultValues={defaultValues}
          submitLabel={submitLabel}
          isEdit
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
