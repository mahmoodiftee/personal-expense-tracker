import { CurrencyCode } from '@finance/shared';

import { computeBudgetTotals, computeCategoryBudgetStatus } from './budget-status.engine';

describe('budget-status.engine', () => {
  const meta = {
    categoryId: 'cat-1',
    categoryName: 'Groceries',
    color: '#64748b',
    currency: CurrencyCode.USD,
  };

  it('computes remaining and used percentage', () => {
    const result = computeCategoryBudgetStatus({
      ...meta,
      budgetMinor: 30_000,
      actualMinor: 12_000,
    });

    expect(result.remainingMinor).toBe(18_000);
    expect(result.usedPct).toBe(40);
    expect(result.isOverBudget).toBe(false);
  });

  it('flags over budget when actual exceeds limit', () => {
    const result = computeCategoryBudgetStatus({
      ...meta,
      budgetMinor: 10_000,
      actualMinor: 12_500,
    });

    expect(result.isOverBudget).toBe(true);
    expect(result.usedPct).toBe(125);
    expect(result.remainingMinor).toBe(-2_500);
  });

  it('aggregates monthly totals', () => {
    const rows = [
      computeCategoryBudgetStatus({ ...meta, budgetMinor: 30_000, actualMinor: 10_000 }),
      computeCategoryBudgetStatus({
        ...meta,
        categoryId: 'cat-2',
        categoryName: 'Dining',
        budgetMinor: 10_000,
        actualMinor: 4_000,
      }),
    ];

    const totals = computeBudgetTotals(rows, CurrencyCode.USD);
    expect(totals.totalBudgetMinor).toBe(40_000);
    expect(totals.totalActualMinor).toBe(14_000);
    expect(totals.totalRemainingMinor).toBe(26_000);
    expect(totals.totalUsedPct).toBe(35);
  });
});
