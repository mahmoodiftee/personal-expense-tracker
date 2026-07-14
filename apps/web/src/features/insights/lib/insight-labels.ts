import { InsightSeverity, InsightType } from '@finance/shared';
import type { LucideIcon } from 'lucide-react';
import { CircleAlert, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import type { SeverityFilter } from './insights-utils';

export function severityFilterLabel(filter: SeverityFilter): string {
  if (filter === 'ALL') return 'All';
  return severityLabel(filter);
}

export function severityLabel(severity: InsightSeverity): string {
  switch (severity) {
    case InsightSeverity.CRITICAL:
      return 'Critical';
    case InsightSeverity.WARNING:
      return 'Warning';
    case InsightSeverity.INFO:
      return 'Info';
    case InsightSeverity.SUCCESS:
      return 'Success';
  }
}

export function insightTypeLabel(type: InsightType): string {
  switch (type) {
    case InsightType.BUDGET_OVERRUN:
      return 'Budget';
    case InsightType.SPENDING_SPIKE:
      return 'Spending';
    case InsightType.SAVINGS_INCREASE:
      return 'Savings';
    case InsightType.LARGEST_SPENDING_CATEGORY:
      return 'Categories';
    case InsightType.UNPAID_FIXED_BILLS:
      return 'Bills';
    case InsightType.NEW_SPENDING_CATEGORY:
      return 'New category';
    case InsightType.SAVINGS_OPPORTUNITY:
      return 'Opportunity';
    case InsightType.RECURRING_DETECTED:
      return 'Recurring';
    case InsightType.SAVINGS_FORECAST:
      return 'Forecast';
    case InsightType.GENERAL:
      return 'General';
  }
}

export function insightTypeIcon(type: InsightType): LucideIcon {
  switch (type) {
    case InsightType.BUDGET_OVERRUN:
    case InsightType.UNPAID_FIXED_BILLS:
      return CircleAlert;
    case InsightType.SPENDING_SPIKE:
      return TrendingUp;
    case InsightType.SAVINGS_INCREASE:
    case InsightType.SAVINGS_FORECAST:
    case InsightType.SAVINGS_OPPORTUNITY:
      return TrendingDown;
    case InsightType.LARGEST_SPENDING_CATEGORY:
    case InsightType.NEW_SPENDING_CATEGORY:
      return Wallet;
    default:
      return Sparkles;
  }
}
