import { SavingsGoalTemplate } from '@finance/shared';

const TEMPLATE_NAMES: Record<Exclude<SavingsGoalTemplate, SavingsGoalTemplate.CUSTOM>, string> = {
  [SavingsGoalTemplate.EMERGENCY_FUND]: 'Emergency Fund',
  [SavingsGoalTemplate.VACATION]: 'Vacation',
  [SavingsGoalTemplate.NEW_LAPTOP]: 'New Laptop',
  [SavingsGoalTemplate.HOUSE_FUND]: 'House Fund',
};

export function resolveGoalName(template: SavingsGoalTemplate, name?: string): string {
  if (template === SavingsGoalTemplate.CUSTOM) {
    return name?.trim() ?? '';
  }
  return name?.trim() || TEMPLATE_NAMES[template];
}
