import { CurrencyCode, InsightSeverity, InsightType, PaymentStatus } from '@finance/shared';

import {
  generateInsights,
  NEW_CATEGORY_LOOKBACK_MONTHS,
  SAVINGS_INCREASE_THRESHOLD_PCT,
  SPENDING_INCREASE_THRESHOLD_PCT,
  type InsightsEngineInput,
} from './insights.engine';

describe('insights.engine', () => {
  const monthKey = '2026-07';
  const currency = CurrencyCode.USD;

  function monthly(overrides: { totalExpenseMinor: number; savingsMinor: number }) {
    return {
      monthKey,
      currency,
      income: { amountMinor: 500_000, currency },
      fixedExpense: { amountMinor: 100_000, currency },
      variableExpense: { amountMinor: overrides.totalExpenseMinor - 100_000, currency },
      totalExpense: { amountMinor: overrides.totalExpenseMinor, currency },
      savings: { amountMinor: overrides.savingsMinor, currency },
      savingsRatePct: 20,
    };
  }

  function baseInput(overrides: Partial<InsightsEngineInput> = {}): InsightsEngineInput {
    return {
      monthKey,
      currentMonth: monthly({ totalExpenseMinor: 240_000, savingsMinor: 60_000 }),
      previousMonth: monthly({ totalExpenseMinor: 180_000, savingsMinor: 40_000 }),
      currentCategories: [
        {
          categoryId: 'cat-groceries',
          categoryName: 'Groceries',
          color: '#22c55e',
          totalMinor: 120_000,
          transactionCount: 8,
        },
        {
          categoryId: 'cat-dining',
          categoryName: 'Dining',
          color: '#f97316',
          totalMinor: 60_000,
          transactionCount: 4,
        },
      ],
      historicalCategoriesByMonth: new Map([
        [
          '2026-06',
          [
            {
              categoryId: 'cat-groceries',
              categoryName: 'Groceries',
              color: '#22c55e',
              totalMinor: 90_000,
              transactionCount: 6,
            },
          ],
        ],
      ]),
      fixedExpenseStatus: {
        monthKey,
        currency,
        totalDue: { amountMinor: 100_000, currency },
        totalPaid: { amountMinor: 100_000, currency },
        totalUnpaid: { amountMinor: 0, currency },
        paidCount: 1,
        unpaidCount: 0,
        items: [
          {
            expenseId: 'exp-rent',
            name: 'Rent',
            dueDay: 1,
            amount: { amountMinor: 100_000, currency },
            status: PaymentStatus.PAID,
            paidAt: '2026-07-01T12:00:00.000Z',
          },
        ],
      },
      overBudgetCategories: [],
      ...overrides,
    };
  }

  it('emits spending spike when expenses rise above threshold', () => {
    const results = generateInsights(baseInput());

    const insight = results.find((item) => item.type === InsightType.SPENDING_SPIKE);
    expect(insight).toBeDefined();
    expect(insight?.severity).toBe(InsightSeverity.WARNING);
    expect(insight?.data?.changePct).toBeGreaterThan(SPENDING_INCREASE_THRESHOLD_PCT);
  });

  it('emits savings increase when savings rise above threshold', () => {
    const results = generateInsights(baseInput());

    const insight = results.find((item) => item.type === InsightType.SAVINGS_INCREASE);
    expect(insight).toBeDefined();
    expect(insight?.severity).toBe(InsightSeverity.SUCCESS);
    expect(insight?.data?.changePct).toBeGreaterThan(SAVINGS_INCREASE_THRESHOLD_PCT);
  });

  it('emits largest spending category insight', () => {
    const results = generateInsights(baseInput());

    const insight = results.find((item) => item.type === InsightType.LARGEST_SPENDING_CATEGORY);
    expect(insight).toBeDefined();
    expect(insight?.data?.categoryName).toBe('Groceries');
    expect(insight?.data?.sharePct).toBe(66.67);
  });

  it('emits unpaid fixed bills insight', () => {
    const input = baseInput({
      fixedExpenseStatus: {
        ...baseInput().fixedExpenseStatus,
        totalPaid: { amountMinor: 0, currency },
        totalUnpaid: { amountMinor: 100_000, currency },
        paidCount: 0,
        unpaidCount: 1,
        items: [
          {
            expenseId: 'exp-rent',
            name: 'Rent',
            dueDay: 1,
            amount: { amountMinor: 100_000, currency },
            status: PaymentStatus.UNPAID,
            paidAt: null,
          },
        ],
      },
    });

    const insight = generateInsights(input).find(
      (item) => item.type === InsightType.UNPAID_FIXED_BILLS,
    );
    expect(insight).toBeDefined();
    expect(insight?.severity).toBe(InsightSeverity.CRITICAL);
  });

  it('emits new spending category insight', () => {
    const results = generateInsights(baseInput());

    const insight = results.find((item) => item.type === InsightType.NEW_SPENDING_CATEGORY);
    expect(insight).toBeDefined();
    expect(insight?.data?.categories).toEqual([
      expect.objectContaining({ categoryName: 'Dining' }),
    ]);
  });

  it('skips month-over-month rules without previous month data', () => {
    const results = generateInsights(baseInput({ previousMonth: null }));

    expect(results.some((item) => item.type === InsightType.SPENDING_SPIKE)).toBe(false);
    expect(results.some((item) => item.type === InsightType.SAVINGS_INCREASE)).toBe(false);
  });

  it('respects new category lookback history', () => {
    expect(NEW_CATEGORY_LOOKBACK_MONTHS).toBeGreaterThan(0);
  });

  it('emits budget overrun insight when categories exceed limits', () => {
    const results = generateInsights(
      baseInput({
        overBudgetCategories: [
          {
            categoryId: 'cat-dining',
            categoryName: 'Dining',
            budgetMinor: 10_000,
            actualMinor: 15_000,
            usedPct: 150,
            currency,
          },
        ],
      }),
    );

    const insight = results.find((item) => item.type === InsightType.BUDGET_OVERRUN);
    expect(insight).toBeDefined();
    expect(insight?.severity).toBe(InsightSeverity.CRITICAL);
    expect(insight?.data?.categories).toEqual([
      expect.objectContaining({ categoryName: 'Dining', usedPct: 150 }),
    ]);
  });

  it('skips budget overrun insight when all categories are within budget', () => {
    const results = generateInsights(baseInput({ overBudgetCategories: [] }));
    expect(results.some((item) => item.type === InsightType.BUDGET_OVERRUN)).toBe(false);
  });
});
