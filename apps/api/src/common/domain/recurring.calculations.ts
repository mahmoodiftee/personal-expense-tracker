import { type AmountPeriod, type Money, type MonthKey, RecurringStatus } from '@finance/shared';

/**
 * Pure, framework-free calculations shared by every recurring-plan feature
 * (income, fixed expenses, …). Structural typing keeps them decoupled from any
 * specific read model (DRY, SRP, easily unit-testable).
 */

/** The amount effective during `monthKey`, or null if no period covers it. */
export function effectiveAmountForMonth(
  plan: { readonly amountHistory: readonly AmountPeriod[] },
  monthKey: MonthKey,
): Money | null {
  const period = plan.amountHistory.find(
    (p) => p.effectiveFrom <= monthKey && (p.effectiveTo === null || monthKey <= p.effectiveTo),
  );
  return period ? period.amount : null;
}

/** Whether a plan is active (status + start/end window) during `monthKey`. */
export function isActiveInMonth(
  plan: {
    readonly status: RecurringStatus;
    readonly startMonth: MonthKey;
    readonly endMonth: MonthKey | null;
  },
  monthKey: MonthKey,
): boolean {
  if (plan.status !== RecurringStatus.ACTIVE) return false;
  if (plan.startMonth > monthKey) return false;
  if (plan.endMonth !== null && plan.endMonth < monthKey) return false;
  return true;
}
