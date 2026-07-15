'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Typography } from '@/components/design-system';
import { FadeIn } from '@/components/design-system';
import type { ApiClientError } from '@/lib/api-client';
import { FormErrorBanner, FormField } from '@/features/expenses/components/form-field';

import { extraIncomeFormSchema, type ExtraIncomeFormValues } from '../lib/schemas';
import { defaultExtraIncomeFormValues } from '../lib/form-mappers';

type ExtraIncomeFormProps = {
  monthKey: string;
  defaultValues?: ExtraIncomeFormValues;
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: ExtraIncomeFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function ExtraIncomeForm({
  monthKey,
  defaultValues,
  submitLabel = 'Add extra income',
  isEdit = false,
  onSubmit,
  onCancel,
}: ExtraIncomeFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const resolvedDefaults = defaultValues ?? defaultExtraIncomeFormValues(monthKey);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExtraIncomeFormValues>({
    resolver: zodResolver(extraIncomeFormSchema),
    defaultValues: resolvedDefaults,
  });

  const submit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
      if (!isEdit) {
        reset(defaultExtraIncomeFormValues(monthKey));
      }
    } catch (error) {
      const clientError = error as ApiClientError;
      setApiError(clientError.message ?? 'Failed to save extra income.');
    }
  });

  return (
    <FadeIn>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormErrorBanner message={apiError ?? undefined} />

        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Input
            id="description"
            placeholder="Bonus, freelance payment, gift…"
            aria-invalid={Boolean(errors.description)}
            {...register('description')}
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

          <FormField label="Date" htmlFor="occurredOn" error={errors.occurredOn?.message}>
            <Input
              id="occurredOn"
              type="date"
              aria-invalid={Boolean(errors.occurredOn)}
              {...register('occurredOn')}
            />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="notes" error={errors.notes?.message}>
          <Textarea
            id="notes"
            placeholder="Optional notes"
            aria-invalid={Boolean(errors.notes)}
            {...register('notes')}
          />
        </FormField>

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
          Extra income counts toward this month&apos;s budget and dashboard totals.
        </Typography>
      </form>
    </FadeIn>
  );
}
