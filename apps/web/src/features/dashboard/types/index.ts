import type { TrendDelta } from '../lib/trends';

export type MetricCardTrend = TrendDelta;

export type ChartPoint = {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRatePct: number;
};

export type DashboardViewModel = {
  monthKey: string;
  monthLabel: string;
  income: string;
  expenses: string;
  savings: string;
  savingsRate: string;
  expenseFixed: string;
  expenseVariable: string;
  forecastAmount: string | null;
  forecastConfidence: string | null;
  forecastMethod: string;
  incomeTrend: MetricCardTrend;
  expenseTrend: MetricCardTrend;
  savingsTrend: MetricCardTrend;
  chartPoints: ChartPoint[];
  categoryBreakdown: Array<{
    name: string;
    color: string;
    total: string;
    sharePct: number;
  }>;
};
