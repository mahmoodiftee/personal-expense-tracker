import type { SavingsGoal, SavingsGoalWithProgress } from '@finance/shared';
import { MoneyMath, SavingsGoalTemplate } from '@finance/shared';

import { templateLabel } from './template-labels';
import type { SavingsGoalFormValues } from './schemas';

export function goalToFormValues(goal: SavingsGoal): SavingsGoalFormValues {
  return {
    template: goal.template,
    name: goal.name,
    targetAmount: MoneyMath.toMajor(goal.targetAmount).toFixed(2),
    currentAmount: MoneyMath.toMajor(goal.currentAmount).toFixed(2),
    targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
    notes: goal.notes ?? '',
  };
}

export function defaultGoalFormValues(
  template: SavingsGoalTemplate = SavingsGoalTemplate.EMERGENCY_FUND,
): SavingsGoalFormValues {
  return {
    template,
    name: template === SavingsGoalTemplate.CUSTOM ? '' : templateLabel(template),
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    notes: '',
  };
}

export function formatEstimatedCompletion(goal: SavingsGoalWithProgress): string {
  if (goal.progress.progressPct >= 100) return 'Goal reached';
  if (!goal.progress.estimatedCompletionMonth) return 'Not enough savings data';
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
    new Date(`${goal.progress.estimatedCompletionMonth}-01T12:00:00`),
  );
}
