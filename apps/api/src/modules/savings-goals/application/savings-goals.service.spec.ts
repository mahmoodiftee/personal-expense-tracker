import { CurrencyCode, SavingsGoalTemplate } from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import { SavingsService } from '../../savings/application/savings.service';
import { SavingsGoalsService } from './savings-goals.service';

describe('SavingsGoalsService', () => {
  const userId = '507f1f77bcf86cd799439011';
  const asOf = '2026-07';

  const goals = [
    {
      id: 'goal-1',
      userId,
      name: 'Emergency Fund',
      template: SavingsGoalTemplate.EMERGENCY_FUND,
      targetAmount: { amountMinor: 100_000, currency: CurrencyCode.USD },
      currentAmount: { amountMinor: 25_000, currency: CurrencyCode.USD },
      targetDate: null,
      notes: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'goal-2',
      userId,
      name: 'Vacation',
      template: SavingsGoalTemplate.VACATION,
      targetAmount: { amountMinor: 50_000, currency: CurrencyCode.USD },
      currentAmount: { amountMinor: 10_000, currency: CurrencyCode.USD },
      targetDate: null,
      notes: null,
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  const history = {
    rangeStart: '2026-02',
    rangeEnd: asOf,
    currency: CurrencyCode.USD,
    months: [],
    totalSaved: { amountMinor: 30_000, currency: CurrencyCode.USD },
    averageSaved: { amountMinor: 5_000, currency: CurrencyCode.USD },
    averageRatePct: 10,
    bestMonth: null,
    worstMonth: null,
  };

  function createService() {
    const repository = {
      findMany: jest.fn().mockResolvedValue(goals),
    };
    const savings = {
      getHistory: jest.fn().mockResolvedValue(history),
    };
    const logger = {
      setContext: jest.fn(),
      log: jest.fn(),
    } as unknown as AppLogger;

    const service = new SavingsGoalsService(
      repository as never,
      savings as unknown as SavingsService,
      logger,
    );

    return { service, repository, savings };
  }

  it('loads savings history once when listing multiple goals', async () => {
    const { service, savings } = createService();

    const overview = await service.listGoals(userId, { asOf, lookbackMonths: 6 });

    expect(savings.getHistory).toHaveBeenCalledTimes(1);
    expect(savings.getHistory).toHaveBeenCalledWith(userId, { from: '2026-02', to: asOf });
    expect(overview.goals).toHaveLength(2);
    expect(overview.goals[0]?.progress.averageMonthlySavings.amountMinor).toBe(5_000);
    expect(overview.goals[1]?.progress.averageMonthlySavings.amountMinor).toBe(5_000);
  });
});
