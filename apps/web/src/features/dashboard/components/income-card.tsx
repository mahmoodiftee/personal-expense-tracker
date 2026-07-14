import { Wallet } from 'lucide-react';

import { MetricCard } from './metric-card';
import type { DashboardViewModel } from '../types';

type IncomeCardProps = Pick<DashboardViewModel, 'income' | 'incomeTrend'>;

export function IncomeCard({ income, incomeTrend }: IncomeCardProps) {
  return (
    <MetricCard
      label="Income"
      value={income}
      icon={Wallet}
      trend={incomeTrend}
      hint="Total this month"
    />
  );
}
