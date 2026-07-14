import type { MonthKey } from '@finance/shared';
import { DomainValidationException } from '../exceptions/app.exception';
import { monthKeyRange } from '../util/month.util';

/** Validates an inclusive month range and returns the month list. */
export function validateMonthRange(from: MonthKey, to: MonthKey, maxMonths: number): MonthKey[] {
  if (from > to) {
    throw new DomainValidationException('`from` month must not be after `to` month');
  }
  const months = monthKeyRange(from, to, maxMonths + 1);
  if (months.length > maxMonths) {
    throw new DomainValidationException(`Range cannot exceed ${maxMonths} months`);
  }
  return months;
}
