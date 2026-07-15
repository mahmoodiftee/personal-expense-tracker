'use client';

import { Cadence, RecurringStatus } from '@finance/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/design-system';
import { FadeIn } from '@/components/design-system';
import type { ApiClientError } from '@/lib/api-client';
import { FormErrorBanner, FormField } from '@/features/expenses/components/form-field';

import { fixedIncomeFormSchema, type FixedIncomeFormValues } from '../lib/schemas';
import { defaultFixedIncomeFormValues } from '../lib/form-mappers';

type FixedIncomeFormProps = {
  defaultValues?: FixedIncomeFormValues;
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: FixedIncomeFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function FixedIncomeForm({
  defaultValues = defaultFixedIncomeFormValues(),
  submitLabel = 'Save income source',
  isEdit = false,
  onSubmit,
  onCancel,
}: FixedIncomeFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FixedIncomeFormValues>({
    resolver: zodResolver(fixedIncomeFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
      if (!isEdit) {
        reset(defaultFixedIncomeFormValues());
      }
    } catch (error) {
      const clientError = error as ApiClientError;
      setApiError(clientError.message ?? 'Failed to save income source.');
    }
  });

  return (
    <FadeIn>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormErrorBanner message={apiError ?? undefined} />

        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Salary, freelance retainer…"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Amount" htmlFor="amount" error={errors.amount?.message}>
            <Input
              id="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              aria-invalid={Boolean(errors.amount)}
              {...register('amount')}
            />
          </FormField>

          <FormField label="Due day" htmlFor="dueDay" error={errors.dueDay?.message}>
            <Input
              id="dueDay"
              type="number"
              min={1}
              max={31}
              aria-invalid={Boolean(errors.dueDay)}
              {...register('dueDay')}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Cadence" htmlFor="cadence" error={errors.cadence?.message}>
            <select
              id="cadence"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              {...register('cadence')}
            >
              {Object.values(Cadence).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Start month" htmlFor="startMonth" error={errors.startMonth?.message}>
            <Input
              id="startMonth"
              placeholder="YYYY-MM"
              disabled={isEdit}
              aria-invalid={Boolean(errors.startMonth)}
              {...register('startMonth')}
            />
          </FormField>
        </div>

        <FormField label="End month (optional)" htmlFor="endMonth" error={errors.endMonth?.message}>
          <Input
            id="endMonth"
            placeholder="YYYY-MM"
            aria-invalid={Boolean(errors.endMonth)}
            {...register('endMonth')}
          />
        </FormField>

        {isEdit ? (
          <FormField label="Status" htmlFor="status" error={errors.status?.message}>
            <select
              id="status"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              {...register('status')}
            >
              {Object.values(RecurringStatus).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </FormField>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : submitLabel}
          </Button>
        </div>

        <Typography variant="caption" className="text-muted-foreground">
          Amount changes on edit apply from the current month onward.
        </Typography>
      </form>
    </FadeIn>
  );
}
