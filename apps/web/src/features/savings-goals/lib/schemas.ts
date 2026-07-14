import { z } from 'zod';
import { SavingsGoalTemplate } from '@finance/shared';

const nonNegativeAmountSchema = z
  .string()
  .min(1, 'Amount is required')
  .refine((value) => {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed >= 0;
  }, 'Enter a valid amount');

const positiveAmountSchema = z
  .string()
  .min(1, 'Target amount is required')
  .refine((value) => {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed > 0;
  }, 'Enter a valid amount greater than 0');

export const savingsGoalFormSchema = z
  .object({
    template: z.nativeEnum(SavingsGoalTemplate),
    name: z.string().trim().max(120, 'Max 120 characters').optional(),
    targetAmount: positiveAmountSchema,
    currentAmount: nonNegativeAmountSchema.default('0'),
    targetDate: z.string().optional(),
    notes: z.string().trim().max(2000, 'Max 2000 characters').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.template === SavingsGoalTemplate.CUSTOM && !values.name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Name is required for custom goals',
        path: ['name'],
      });
    }

    const target = Number.parseFloat(values.targetAmount);
    const current = Number.parseFloat(values.currentAmount);
    if (!Number.isNaN(target) && !Number.isNaN(current) && current > target) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Current amount cannot exceed target',
        path: ['currentAmount'],
      });
    }
  });

export type SavingsGoalFormValues = z.infer<typeof savingsGoalFormSchema>;

export { toAmountMinor, defaultCurrency } from '@/features/expenses/lib/schemas';
