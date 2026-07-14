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

import { variableExpenseFormSchema, type VariableExpenseFormValues } from '../lib/schemas';
import { defaultVariableExpenseFormValues } from '../lib/form-mappers';
import { FormErrorBanner, FormField } from './form-field';

type VariableExpenseFormProps = {
  defaultValues?: VariableExpenseFormValues;
  submitLabel?: string;
  onSubmit: (values: VariableExpenseFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function VariableExpenseForm({
  defaultValues = defaultVariableExpenseFormValues(),
  submitLabel = 'Save expense',
  onSubmit,
  onCancel,
}: VariableExpenseFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VariableExpenseFormValues>({
    resolver: zodResolver(variableExpenseFormSchema),
    defaultValues,
  });

  const submit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
      if (!defaultValues.description) {
        reset(defaultVariableExpenseFormValues());
      }
    } catch (error) {
      const clientError = error as ApiClientError;
      setApiError(clientError.message ?? 'Failed to save expense.');
    }
  });

  return (
    <FadeIn>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <FormErrorBanner message={apiError ?? undefined} />

        <FormField label="Description" htmlFor="description" error={errors.description?.message}>
          <Input
            id="description"
            placeholder="Groceries, fuel, dining…"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'description-error' : undefined}
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

        <FormField label="Category" htmlFor="categoryName" error={errors.categoryName?.message}>
          <Input
            id="categoryName"
            placeholder="Optional category"
            aria-invalid={Boolean(errors.categoryName)}
            {...register('categoryName')}
          />
        </FormField>

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
          All fields marked with validation run before submit. Server errors appear above.
        </Typography>
      </form>
    </FadeIn>
  );
}
