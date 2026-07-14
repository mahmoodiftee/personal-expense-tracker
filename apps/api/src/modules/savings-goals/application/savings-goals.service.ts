import { Inject, Injectable } from '@nestjs/common';
import {
  CurrencyCode,
  type Money,
  type MonthKey,
  type SavingsGoal,
  type SavingsGoalProgress,
  type SavingsGoalsOverview,
  type SavingsGoalWithProgress,
  SavingsGoalTemplate,
} from '@finance/shared';

import { AppLogger } from '../../../core/logger/app-logger.service';
import { reconcileCurrency } from '../../../common/domain/currency.util';
import {
  DomainValidationException,
  ResourceNotFoundException,
} from '../../../common/exceptions/app.exception';
import { currentMonthKey, shiftMonthKey } from '../../../common/util/month.util';
import { SavingsService } from '../../savings/application/savings.service';
import { computeGoalProgress } from '../domain/goal-progress.engine';
import { resolveGoalName } from '../domain/goal-template.util';
import {
  SAVINGS_GOAL_REPOSITORY,
  type SavingsGoalRepositoryPort,
} from '../domain/savings-goal.repository.port';
import type { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import type { SavingsGoalsOverviewQueryDto } from './dto/savings-goals-query.dto';
import type { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(
    @Inject(SAVINGS_GOAL_REPOSITORY)
    private readonly goals: SavingsGoalRepositoryPort,
    private readonly savings: SavingsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(SavingsGoalsService.name);
  }

  async createGoal(userId: string, dto: CreateSavingsGoalDto): Promise<SavingsGoalWithProgress> {
    const name = resolveGoalName(dto.template, dto.name);
    if (!name) {
      throw new DomainValidationException('Name is required for custom goals');
    }

    this.assertAmounts(dto.targetAmount, dto.currentAmount ?? dto.targetAmount);

    const goal = await this.goals.create({
      userId,
      name,
      template: dto.template,
      targetAmount: dto.targetAmount,
      currentAmount: dto.currentAmount ?? { amountMinor: 0, currency: dto.targetAmount.currency },
      targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
      notes: dto.notes ?? null,
    });

    this.logger.log(`Savings goal created: ${goal.id} (${goal.name}) [user ${userId}]`);
    return this.attachProgress(userId, goal, currentMonthKey());
  }

  async getGoal(userId: string, id: string, asOf?: MonthKey): Promise<SavingsGoalWithProgress> {
    const goal = await this.getOwnedGoalOrThrow(userId, id);
    return this.attachProgress(userId, goal, asOf ?? currentMonthKey());
  }

  async listGoals(
    userId: string,
    query: SavingsGoalsOverviewQueryDto,
  ): Promise<SavingsGoalsOverview> {
    const asOf = query.asOf ?? currentMonthKey();
    const lookbackMonths = query.lookbackMonths ?? 6;
    const items = await this.goals.findMany(userId);

    const progressContext = await this.loadProgressContext(userId, asOf, lookbackMonths);
    const withProgress = items.map((goal) => this.applyProgress(goal, asOf, progressContext));

    const currency = withProgress[0]?.targetAmount.currency ?? CurrencyCode.USD;
    return { currency, goals: withProgress };
  }

  async updateGoal(
    userId: string,
    id: string,
    dto: UpdateSavingsGoalDto,
  ): Promise<SavingsGoalWithProgress> {
    const existing = await this.getOwnedGoalOrThrow(userId, id);

    const targetAmount = dto.targetAmount ?? existing.targetAmount;
    const currentAmount = dto.currentAmount ?? existing.currentAmount;
    this.assertAmounts(targetAmount, currentAmount);

    const nextTemplate = dto.template ?? existing.template;
    const changes: {
      name?: string;
      template?: SavingsGoalTemplate;
      targetAmount?: Money;
      currentAmount?: Money;
      targetDate?: Date | null;
      notes?: string | null;
    } = {};

    if (dto.template !== undefined) changes.template = dto.template;
    if (dto.targetAmount !== undefined) changes.targetAmount = dto.targetAmount;
    if (dto.currentAmount !== undefined) changes.currentAmount = dto.currentAmount;
    if (dto.notes !== undefined) changes.notes = dto.notes;
    if (dto.targetDate !== undefined) {
      changes.targetDate = dto.targetDate ? new Date(dto.targetDate) : null;
    }
    if (dto.name !== undefined) {
      changes.name = resolveGoalName(nextTemplate, dto.name);
    } else if (dto.template !== undefined && nextTemplate !== SavingsGoalTemplate.CUSTOM) {
      changes.name = resolveGoalName(nextTemplate);
    }

    const updated = await this.goals.update(userId, id, changes);

    if (!updated) throw new ResourceNotFoundException('Savings goal', id);

    this.logger.log(`Savings goal updated: ${id} [user ${userId}]`);
    return this.attachProgress(userId, updated, currentMonthKey());
  }

  async deleteGoal(userId: string, id: string): Promise<void> {
    await this.getOwnedGoalOrThrow(userId, id);
    const deleted = await this.goals.delete(userId, id);
    if (!deleted) throw new ResourceNotFoundException('Savings goal', id);
    this.logger.log(`Savings goal deleted: ${id} [user ${userId}]`);
  }

  private async attachProgress(
    userId: string,
    goal: SavingsGoal,
    asOf: MonthKey,
    lookbackMonths = 6,
  ): Promise<SavingsGoalWithProgress> {
    const progressContext = await this.loadProgressContext(userId, asOf, lookbackMonths);
    return this.applyProgress(goal, asOf, progressContext);
  }

  private async loadProgressContext(
    userId: string,
    asOf: MonthKey,
    lookbackMonths: number,
  ): Promise<GoalProgressContext> {
    const from = shiftMonthKey(asOf, -(lookbackMonths - 1));
    const history = await this.savings.getHistory(userId, { from, to: asOf });
    return {
      averageMonthlySavingsMinor: history.averageSaved.amountMinor,
      historyMonths: history.months.length,
    };
  }

  private applyProgress(
    goal: SavingsGoal,
    asOf: MonthKey,
    context: GoalProgressContext,
  ): SavingsGoalWithProgress {
    const currency = reconcileCurrency(goal.targetAmount.currency, goal.currentAmount.currency);

    const computed = computeGoalProgress({
      goalId: goal.id,
      targetAmountMinor: goal.targetAmount.amountMinor,
      currentAmountMinor: goal.currentAmount.amountMinor,
      averageMonthlySavingsMinor: context.averageMonthlySavingsMinor,
      currency,
      asOfMonth: asOf,
      targetDate: goal.targetDate,
      historyMonths: context.historyMonths,
    });

    const progress: SavingsGoalProgress = {
      goalId: goal.id,
      progressPct: computed.progressPct,
      remaining: { amountMinor: computed.remainingMinor, currency },
      estimatedCompletionMonth: computed.estimatedCompletionMonth,
      estimatedCompletionDate: computed.estimatedCompletionDate,
      averageMonthlySavings: { amountMinor: context.averageMonthlySavingsMinor, currency },
      confidencePct: computed.confidencePct,
      onTrack: computed.onTrack,
    };

    return { ...goal, progress };
  }

  private assertAmounts(target: Money, current: Money): void {
    if (target.amountMinor <= 0) {
      throw new DomainValidationException('Target amount must be greater than zero');
    }
    if (current.amountMinor < 0) {
      throw new DomainValidationException('Current amount cannot be negative');
    }
    if (current.amountMinor > target.amountMinor) {
      throw new DomainValidationException('Current amount cannot exceed target amount');
    }
    reconcileCurrency(target.currency, current.currency);
  }

  private async getOwnedGoalOrThrow(userId: string, id: string): Promise<SavingsGoal> {
    const goal = await this.goals.findById(userId, id);
    if (!goal) throw new ResourceNotFoundException('Savings goal', id);
    return goal;
  }
}

type GoalProgressContext = {
  readonly averageMonthlySavingsMinor: number;
  readonly historyMonths: number;
};
