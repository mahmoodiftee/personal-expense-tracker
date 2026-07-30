import {
  CurrencyCode,
  type FixedExpense,
  type LoanProgress,
  type LoanWithProgress,
  type LoansOverview,
  type MonthKey,
  PaymentStatus,
  PlanSubtype,
} from '@finance/shared';
import {
  effectiveAmountForMonth,
  isActiveInMonth,
} from '../../../common/domain/recurring.calculations';
import { round2 } from '../../../common/util/math.util';
import { compareMonthKeys, monthKeyRange, shiftMonthKey } from '../../../common/util/month.util';
import type { ExpensePaymentRecord } from '../../fixed-expenses/domain/expense-payment.repository.port';

/** Builds loan progress from a fixed expense and its payment history. */
export function buildLoanProgress(
  expense: FixedExpense,
  payments: readonly ExpensePaymentRecord[],
  asOfMonth: MonthKey,
): LoanWithProgress | null {
  if (expense.planSubtype !== PlanSubtype.LOAN || !expense.principalAmount) {
    return null;
  }

  const currency = expense.principalAmount.currency;
  const totalTakenMinor = expense.principalAmount.amountMinor;
  const relevantPayments = payments.filter(
    (payment) =>
      payment.planId === expense.id &&
      payment.status === PaymentStatus.PAID &&
      compareMonthKeys(payment.monthKey, expense.startMonth) >= 0 &&
      compareMonthKeys(payment.monthKey, asOfMonth) <= 0 &&
      isActiveInMonth(expense, payment.monthKey),
  );

  const paidMinor = relevantPayments.reduce((sum, payment) => sum + payment.amount.amountMinor, 0);
  const remainingMinor = Math.max(0, totalTakenMinor - paidMinor);
  const progressPct =
    totalTakenMinor > 0 ? round2(Math.min(100, (paidMinor / totalTakenMinor) * 100)) : 0;

  const monthlyInstallment = isActiveInMonth(expense, asOfMonth)
    ? effectiveAmountForMonth(expense, asOfMonth)
    : effectiveAmountForMonth(expense, expense.startMonth);

  const progress: LoanProgress = {
    totalTaken: { amountMinor: totalTakenMinor, currency },
    paid: { amountMinor: paidMinor, currency },
    remaining: { amountMinor: remainingMinor, currency },
    progressPct,
    monthlyInstallment,
    monthsRemaining: countRemainingMonths(expense, asOfMonth),
    installmentsPaid: relevantPayments.length,
  };

  return {
    id: expense.id,
    name: expense.name,
    startMonth: expense.startMonth,
    endMonth: expense.endMonth,
    dueDay: expense.dueDay,
    status: expense.status,
    progress,
  };
}

function countRemainingMonths(expense: FixedExpense, asOfMonth: MonthKey): number | null {
  if (!expense.endMonth) return null;
  if (compareMonthKeys(asOfMonth, expense.endMonth) >= 0) return 0;

  const from =
    compareMonthKeys(asOfMonth, expense.startMonth) >= 0
      ? shiftMonthKey(asOfMonth, 1)
      : expense.startMonth;
  return monthKeyRange(from, expense.endMonth).filter((monthKey) =>
    isActiveInMonth(expense, monthKey),
  ).length;
}

export function buildLoansOverview(
  loans: readonly FixedExpense[],
  payments: readonly ExpensePaymentRecord[],
  asOfMonth: MonthKey,
): LoansOverview {
  const items = loans
    .map((loan) => buildLoanProgress(loan, payments, asOfMonth))
    .filter((item): item is LoanWithProgress => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const currency = items[0]?.progress.totalTaken.currency ?? CurrencyCode.BDT;

  return {
    asOf: asOfMonth,
    currency,
    loans: items,
  };
}
