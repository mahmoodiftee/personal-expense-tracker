'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Category } from '@finance/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ApiClientError } from '@/lib/api-client';
import { FormErrorBanner, FormField } from '@/features/expenses/components/form-field';

import { budgetFormSchema, type BudgetFormValues } from '../lib/schemas';

type BudgetFormProps = {
  defaultValues: BudgetFormValues;
  categories: Category[];
  submitLabel?: string;
  isEdit?: boolean;
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  onCancel?: () => void;
};

export function BudgetForm({
  defaultValues,
  categories,
  submitLabel = 'Save budget',
  isEdit,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const [apiError, setApiError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues,
  });

  useEffect(() => {
    register('month');
    register('categoryId');
  }, [register]);

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
            error instanceof Error ? error.message : 'Something went wrong while saving the budget';
          setApiError((error as ApiClientError)?.message ?? message);
        }
      })}
    >
      <FormErrorBanner message={apiError} />

      {!isEdit ? (
        <FormField label="Category" htmlFor="categoryId" error={errors.categoryId?.message}>
          <select
            id="categoryId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={defaultValues.categoryId}
            {...register('categoryId')}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <FormField label="Monthly limit" htmlFor="limitAmount" error={errors.limitAmount?.message}>
        <Input
          id="limitAmount"
          inputMode="decimal"
          placeholder="300"
          {...register('limitAmount')}
        />
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
