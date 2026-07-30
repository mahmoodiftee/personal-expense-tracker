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
import { cn } from '@/lib/utils';

import { fixedExpenseFormSchema, type FixedExpenseFormValues } from '../lib/schemas';
import { defaultFixedExpenseFormValues } from '../lib/form-mappers';
import { FormErrorBanner, FormField } from './form-field';

type FixedExpenseFormProps = {
  defaultValues?: FixedExpenseFormValues;
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: FixedExpenseFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function FixedExpenseForm({
  defaultValues = defaultFixedExpenseFormValues(),
  submitLabel = 'Save fixed expense',
  isEdit = false,
  onSubmit,
  onCancel,
}: FixedExpenseFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FixedExpenseFormValues>({
    resolver: zodResolver(fixedExpenseFormSchema),
    defaultValues,
  });

  const isLoan = watch('isLoan');

  const submit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
      if (!isEdit) {
        reset(defaultFixedExpenseFormValues());
      }
    } catch (error) {
      const clientError = error as ApiClientError;
      setApiError(clientError.message ?? 'Failed to save fixed expense.');
    }
  });

  return (
    <FadeIn>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormErrorBanner message={apiError ?? undefined} />

        <FormField label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Rent, internet, insurance…"
            aria-invalid={Boolean(errors.name)}
            {...register('name')}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label={isLoan ? 'Monthly EMI' : 'Amount'}
            htmlFor="amount"
            error={errors.amount?.message}
          >
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

        <FormField
          label={isLoan ? 'End month (loan term)' : 'End month (optional)'}
          htmlFor="endMonth"
          error={errors.endMonth?.message}
        >
          <Input
            id="endMonth"
            placeholder="YYYY-MM"
            aria-invalid={Boolean(errors.endMonth)}
            {...register('endMonth')}
          />
        </FormField>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-4 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-input"
              {...register('isLoan')}
            />
            <span>
              <Typography variant="label">This is a bank loan</Typography>
              <Typography variant="caption" className="block text-muted-foreground">
                Track total borrowed, amount paid, and months remaining on the dashboard.
              </Typography>
            </span>
          </label>

          <div className={cn('space-y-3', !isLoan && 'hidden')} aria-hidden={!isLoan}>
            <FormField
              label="Total amount borrowed"
              htmlFor="principalAmount"
              error={errors.principalAmount?.message}
            >
              <Input
                id="principalAmount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                aria-invalid={Boolean(errors.principalAmount)}
                {...register('principalAmount')}
              />
            </FormField>
          </div>
        </div>

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
