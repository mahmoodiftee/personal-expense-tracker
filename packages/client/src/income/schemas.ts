import { z } from 'zod';
import { Cadence, RecurringStatus } from '@finance/shared';

import { monthKeySchema } from '../expenses/schemas';

const positiveAmountSchema = z
  .string()
  .min(1, 'Amount is required')
  .refine((value) => {
    const parsed = Number.parseFloat(value);
    return !Number.isNaN(parsed) && parsed > 0;
  }, 'Enter a valid amount greater than 0');

export const extraIncomeFormSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(200, 'Max 200 characters'),
  amount: positiveAmountSchema,
  occurredOn: z.string().min(1, 'Date is required'),
  notes: z.string().trim().max(2000, 'Max 2000 characters').optional(),
});

export type ExtraIncomeFormValues = z.infer<typeof extraIncomeFormSchema>;

export const fixedIncomeFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Max 120 characters'),
  amount: positiveAmountSchema,
  dueDay: z.coerce.number().int().min(1, 'Min day 1').max(31, 'Max day 31'),
  cadence: z.nativeEnum(Cadence),
  startMonth: monthKeySchema,
  endMonth: z
    .string()
    .optional()
    .refine((value) => !value || /^\d{4}-(0[1-9]|1[0-2])$/.test(value), 'Use YYYY-MM format'),
  status: z.nativeEnum(RecurringStatus).optional(),
});

export type FixedIncomeFormValues = z.infer<typeof fixedIncomeFormSchema>;
