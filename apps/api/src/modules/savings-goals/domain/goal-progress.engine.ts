import type { CurrencyCode, MonthKey } from '@finance/shared';

import { shiftMonthKey } from '../../../common/util/month.util';

export type GoalProgressInput = {
  readonly goalId: string;
  readonly targetAmountMinor: number;
  readonly currentAmountMinor: number;
  readonly averageMonthlySavingsMinor: number;
  readonly currency: CurrencyCode;
  readonly asOfMonth: MonthKey;
  readonly targetDate: string | null;
  readonly historyMonths: number;
};

export type GoalProgressResult = {
  readonly progressPct: number;
  readonly remainingMinor: number;
  readonly estimatedCompletionMonth: MonthKey | null;
  readonly estimatedCompletionDate: string | null;
  readonly confidencePct: number;
  readonly onTrack: boolean | null;
};

const FULL_CONFIDENCE_MONTHS = 6;

/** Pure goal progress and ETA calculation from savings history averages. */
export function computeGoalProgress(input: GoalProgressInput): GoalProgressResult {
  const target = Math.max(input.targetAmountMinor, 0);
  const current = Math.max(input.currentAmountMinor, 0);
  const remainingMinor = Math.max(target - current, 0);

  const progressPct = target === 0 ? 100 : round2(Math.min(100, (current / target) * 100));

  if (remainingMinor === 0) {
    return {
      progressPct: 100,
      remainingMinor: 0,
      estimatedCompletionMonth: null,
      estimatedCompletionDate: null,
      confidencePct: 100,
      onTrack: computeOnTrack(null, input.targetDate),
    };
  }

  const average = input.averageMonthlySavingsMinor;
  if (average <= 0) {
    return {
      progressPct,
      remainingMinor,
      estimatedCompletionMonth: null,
      estimatedCompletionDate: null,
      confidencePct: 0,
      onTrack: computeOnTrack(null, input.targetDate),
    };
  }

  const monthsNeeded = Math.ceil(remainingMinor / average);
  const estimatedCompletionMonth = shiftMonthKey(input.asOfMonth, monthsNeeded);
  const estimatedCompletionDate = endOfMonthIso(estimatedCompletionMonth);

  const confidencePct = Math.min(
    100,
    Math.round(
      (Math.min(input.historyMonths, FULL_CONFIDENCE_MONTHS) / FULL_CONFIDENCE_MONTHS) * 100,
    ),
  );

  return {
    progressPct,
    remainingMinor,
    estimatedCompletionMonth,
    estimatedCompletionDate,
    confidencePct,
    onTrack: computeOnTrack(estimatedCompletionDate, input.targetDate),
  };
}

function computeOnTrack(
  estimatedCompletionDate: string | null,
  targetDate: string | null,
): boolean | null {
  if (!targetDate) return null;
  if (!estimatedCompletionDate) return false;
  return new Date(estimatedCompletionDate).getTime() <= new Date(targetDate).getTime();
}

/** Last moment of the given month in UTC as ISO-8601. */
export function endOfMonthIso(monthKey: MonthKey): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
