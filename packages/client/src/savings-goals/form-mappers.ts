import { MoneyMath, SavingsGoalTemplate, type SavingsGoalWithProgress } from '@finance/shared';

import { toDateInputFromIso } from '../expenses/schemas';
import type { SavingsGoalFormValues } from './schemas';

export const GOAL_TEMPLATE_OPTIONS: { template: SavingsGoalTemplate; label: string }[] = [
  { template: SavingsGoalTemplate.EMERGENCY_FUND, label: 'Emergency Fund' },
  { template: SavingsGoalTemplate.VACATION, label: 'Vacation' },
  { template: SavingsGoalTemplate.NEW_LAPTOP, label: 'New Laptop' },
  { template: SavingsGoalTemplate.HOUSE_FUND, label: 'House Fund' },
  { template: SavingsGoalTemplate.CUSTOM, label: 'Custom' },
];

export function templateLabel(template: SavingsGoalTemplate): string {
  return GOAL_TEMPLATE_OPTIONS.find((item) => item.template === template)?.label ?? template;
}

export function savingsGoalToFormValues(goal: SavingsGoalWithProgress): SavingsGoalFormValues {
  return {
    template: goal.template,
    name: goal.name ?? '',
    targetAmount: MoneyMath.toMajor(goal.targetAmount).toFixed(2),
    currentAmount: MoneyMath.toMajor(goal.currentAmount).toFixed(2),
    targetDate: goal.targetDate ? toDateInputFromIso(goal.targetDate) : '',
    notes: goal.notes ?? '',
  };
}

export function defaultSavingsGoalFormValues(): SavingsGoalFormValues {
  return {
    template: SavingsGoalTemplate.EMERGENCY_FUND,
    name: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: '',
    notes: '',
  };
}
