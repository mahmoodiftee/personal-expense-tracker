import { z } from 'zod';

import { monthKeySchema } from '@/features/expenses/lib/schemas';

const positiveAmountSchema = z
  .string()
  .min(1, 'Budget limit is required')
  .refine((value) => {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed > 0;
  }, 'Enter a valid amount greater than 0');

export const budgetFormSchema = z.object({
  month: monthKeySchema,
  categoryId: z.string().min(1, 'Select a category'),
  limitAmount: positiveAmountSchema,
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export { toAmountMinor, defaultCurrency } from '@/features/expenses/lib/schemas';
