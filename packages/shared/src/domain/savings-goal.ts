import type { Money } from './money';
import type { EntityTimestamps, MonthKey } from './models';
import type { CurrencyCode, SavingsGoalTemplate } from './enums';

/**
 * Savings goal domain read models. Goals are user-defined targets with manually
 * tracked progress; ETA fields are derived from recent savings history.
 */

export interface SavingsGoal extends EntityTimestamps {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly template: SavingsGoalTemplate;
  readonly targetAmount: Money;
  readonly currentAmount: Money;
  /** Optional target date (ISO-8601 calendar date). */
  readonly targetDate: string | null;
  readonly notes: string | null;
}

export interface SavingsGoalProgress {
  readonly goalId: string;
  /** 0–100, capped at 100 when current meets or exceeds target. */
  readonly progressPct: number;
  readonly remaining: Money;
  /** Estimated month the goal is reached at average monthly savings (YYYY-MM). */
  readonly estimatedCompletionMonth: MonthKey | null;
  /** ISO date for the estimated completion (end of estimated month, UTC). */
  readonly estimatedCompletionDate: string | null;
  readonly averageMonthlySavings: Money;
  /** Confidence in the ETA based on savings history depth (0–100). */
  readonly confidencePct: number;
  /** Whether the ETA is on or before targetDate; null when no target date. */
  readonly onTrack: boolean | null;
}

export interface SavingsGoalWithProgress extends SavingsGoal {
  readonly progress: SavingsGoalProgress;
}

export interface SavingsGoalsOverview {
  readonly currency: CurrencyCode;
  readonly goals: readonly SavingsGoalWithProgress[];
}
