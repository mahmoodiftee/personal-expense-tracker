import { CurrencyCode } from '@finance/shared';

import { computeGoalProgress, endOfMonthIso } from './goal-progress.engine';

describe('computeGoalProgress', () => {
  const base = {
    goalId: 'goal-1',
    targetAmountMinor: 10_000_00,
    currentAmountMinor: 2_500_00,
    averageMonthlySavingsMinor: 500_00,
    currency: CurrencyCode.USD,
    asOfMonth: '2026-07',
    targetDate: null as string | null,
    historyMonths: 6,
  };

  it('computes progress and remaining amount', () => {
    const result = computeGoalProgress(base);
    expect(result.progressPct).toBe(25);
    expect(result.remainingMinor).toBe(7_500_00);
  });

  it('estimates completion month from average savings', () => {
    const result = computeGoalProgress(base);
    expect(result.estimatedCompletionMonth).toBe('2027-10');
    expect(result.estimatedCompletionDate).toBe(endOfMonthIso('2027-10'));
  });

  it('returns 100% progress when target is met', () => {
    const result = computeGoalProgress({
      ...base,
      currentAmountMinor: 10_000_00,
    });
    expect(result.progressPct).toBe(100);
    expect(result.remainingMinor).toBe(0);
    expect(result.estimatedCompletionMonth).toBeNull();
  });

  it('returns null ETA when average savings is zero or negative', () => {
    const result = computeGoalProgress({
      ...base,
      averageMonthlySavingsMinor: 0,
    });
    expect(result.estimatedCompletionMonth).toBeNull();
    expect(result.confidencePct).toBe(0);
  });

  it('marks onTrack when ETA is before target date', () => {
    const result = computeGoalProgress({
      ...base,
      targetDate: '2028-01-01T00:00:00.000Z',
    });
    expect(result.onTrack).toBe(true);
  });

  it('marks off track when ETA exceeds target date', () => {
    const result = computeGoalProgress({
      ...base,
      targetDate: '2026-08-01T00:00:00.000Z',
    });
    expect(result.onTrack).toBe(false);
  });
});
