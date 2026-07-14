'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SavingsGoalTemplate } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ApiClientError } from '@/lib/api-client';
import { FormErrorBanner, FormField } from '@/features/expenses/components/form-field';

import { GOAL_TEMPLATE_OPTIONS } from '../lib/template-labels';
import { savingsGoalFormSchema, type SavingsGoalFormValues } from '../lib/schemas';

type SavingsGoalFormProps = {
  defaultValues: SavingsGoalFormValues;
  submitLabel?: string;
  onSubmit: (values: SavingsGoalFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function SavingsGoalForm({
  defaultValues,
  submitLabel = 'Save goal',
  onSubmit,
  onCancel,
}: SavingsGoalFormProps) {
  const [apiError, setApiError] = useState<string>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalFormValues>({
    resolver: zodResolver(savingsGoalFormSchema),
    defaultValues,
  });

  const template = watch('template');
  const isCustom = template === SavingsGoalTemplate.CUSTOM;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        setApiError(undefined);
        try {
          await onSubmit(values);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Something went wrong while saving the goal';
          setApiError((error as ApiClientError)?.message ?? message);
        }
      })}
    >
      <FormErrorBanner message={apiError} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Goal type</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOAL_TEMPLATE_OPTIONS.map(({ template: value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                template === value
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/40',
              )}
              onClick={() => {
                setValue('template', value, { shouldValidate: true });
                if (value !== SavingsGoalTemplate.CUSTOM) {
                  setValue('name', label, { shouldValidate: true });
                }
              }}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {isCustom ? (
        <FormField label="Goal name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="e.g. Wedding fund" {...register('name')} />
        </FormField>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Target amount"
          htmlFor="targetAmount"
          error={errors.targetAmount?.message}
        >
          <Input
            id="targetAmount"
            inputMode="decimal"
            placeholder="5000"
            {...register('targetAmount')}
          />
        </FormField>
        <FormField
          label="Current saved"
          htmlFor="currentAmount"
          error={errors.currentAmount?.message}
        >
          <Input
            id="currentAmount"
            inputMode="decimal"
            placeholder="0"
            {...register('currentAmount')}
          />
        </FormField>
      </div>

      <FormField
        label="Target date (optional)"
        htmlFor="targetDate"
        error={errors.targetDate?.message}
      >
        <Input id="targetDate" type="date" {...register('targetDate')} />
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes" error={errors.notes?.message}>
        <Textarea id="notes" rows={3} placeholder="Why this goal matters…" {...register('notes')} />
      </FormField>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
