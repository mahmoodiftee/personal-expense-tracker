import { SavingsGoalTemplate } from '@finance/shared';
import { Home, Laptop, Palmtree, PiggyBank, Sparkles, type LucideIcon } from 'lucide-react';

export const GOAL_TEMPLATE_OPTIONS: {
  template: SavingsGoalTemplate;
  label: string;
  icon: LucideIcon;
}[] = [
  { template: SavingsGoalTemplate.EMERGENCY_FUND, label: 'Emergency Fund', icon: PiggyBank },
  { template: SavingsGoalTemplate.VACATION, label: 'Vacation', icon: Palmtree },
  { template: SavingsGoalTemplate.NEW_LAPTOP, label: 'New Laptop', icon: Laptop },
  { template: SavingsGoalTemplate.HOUSE_FUND, label: 'House Fund', icon: Home },
  { template: SavingsGoalTemplate.CUSTOM, label: 'Custom', icon: Sparkles },
];

export function templateLabel(template: SavingsGoalTemplate): string {
  return GOAL_TEMPLATE_OPTIONS.find((item) => item.template === template)?.label ?? template;
}

export function templateIcon(template: SavingsGoalTemplate): LucideIcon {
  return GOAL_TEMPLATE_OPTIONS.find((item) => item.template === template)?.icon ?? Sparkles;
}
