import { type IncomeSource, type Money, type MonthKey, RecurringStatus } from '@finance/shared';

/**
 * Pure domain calculations for income. Framework-free and dependency-free so
 * they are trivially unit-testable and reused by the mapper and the service.
 */

/** The amount effective during `monthKey`, or null if no period covers it. */
export function effectiveAmountForMonth(
  source: Pick<IncomeSource, 'amountHistory'>,
  monthKey: MonthKey,
): Money | null {
  const period = source.amountHistory.find(
    (p) => p.effectiveFrom <= monthKey && (p.effectiveTo === null || monthKey <= p.effectiveTo),
  );
  return period ? period.amount : null;
}

/** Whether a source is active (status + start/end window) during `monthKey`. */
export function isActiveInMonth(
  source: Pick<IncomeSource, 'status' | 'startMonth' | 'endMonth'>,
  monthKey: MonthKey,
): boolean {
  if (source.status !== RecurringStatus.ACTIVE) return false;
  if (source.startMonth > monthKey) return false;
  if (source.endMonth !== null && source.endMonth < monthKey) return false;
  return true;
}
