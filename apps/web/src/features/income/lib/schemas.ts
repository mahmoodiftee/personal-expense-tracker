import { z } from 'zod';
import { Cadence, CurrencyCode, RecurringStatus } from '@finance/shared';

const monthKeyRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const monthKeySchema = z.string().regex(monthKeyRegex, 'Use YYYY-MM format');

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
    .refine((value) => !value || monthKeyRegex.test(value), 'Use YYYY-MM format'),
  status: z.nativeEnum(RecurringStatus).optional(),
});

export type FixedIncomeFormValues = z.infer<typeof fixedIncomeFormSchema>;

export const defaultCurrency: CurrencyCode = CurrencyCode.BDT;

export function toIsoFromDateInput(dateInput: string): string {
  const [yearStr, monthStr, dayStr] = dateInput.split('-');
  return new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr), 12).toISOString();
}

export function toDateInputFromIso(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toAmountMinor(amountMajor: string, currency: CurrencyCode) {
  return {
    amountMinor: Math.round(Number.parseFloat(amountMajor) * 100),
    currency,
  };
}
