import {
  MoneyMath,
  type ForecastAnalytics,
  type MonthlyTrends,
  type SavingsTrends,
  type SpendingTrends,
} from '@finance/shared';

import { formatMoney, formatPercent } from '@/lib/format-money';
import { formatMonthLabel, formatMonthShort } from '@/lib/month';

import type { AnalyticsData } from '../api/fetch-analytics';
import { formatTrendPct, trendDirectionToMetric } from './trend-utils';

export type SpendingChartPoint = {
  label: string;
  fixed: number;
  variable: number;
  total: number;
};

export type SavingsChartPoint = {
  label: string;
  savings: number;
  savingsRatePct: number;
};

export type MonthlyComparisonPoint = {
  label: string;
  income: number;
  expenses: number;
  savings: number;
};

export type ForecastChartPoint = {
  label: string;
  projected: number;
  cumulative: number;
};

export type AnalyticsSummaryCard = {
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
};

export type AnalyticsViewModel = {
  rangeLabel: string;
  currency: string;
  summaryCards: AnalyticsSummaryCard[];
  spendingPoints: SpendingChartPoint[];
  savingsPoints: SavingsChartPoint[];
  comparisonPoints: MonthlyComparisonPoint[];
  forecastPoints: ForecastChartPoint[];
  forecastConfidence: string;
  forecastMethod: string;
  methodComparison: Array<{ method: string; amount: string; confidence: string }>;
};

export function mapAnalyticsToViewModel(data: {
  monthly: MonthlyTrends;
  savings: SavingsTrends;
  spending: SpendingTrends;
  forecast: ForecastAnalytics;
}): AnalyticsViewModel {
  const { monthly, savings, spending, forecast } = data;

  return {
    rangeLabel: `${formatMonthLabel(monthly.rangeStart)} – ${formatMonthLabel(monthly.rangeEnd)}`,
    currency: monthly.currency,
    summaryCards: [
      {
        label: 'Avg. spending',
        value: formatMoney(spending.summary.averageTotal),
        hint: `${formatPercent(spending.summary.fixedSharePct, 0)} fixed · ${formatPercent(spending.summary.variableSharePct, 0)} variable`,
      },
      {
        label: 'Avg. savings',
        value: formatMoney(savings.averageSaved),
        hint: `${formatPercent(savings.averageRatePct)} rate`,
        trend: {
          value: formatTrendPct(savings.points.at(-1)?.changeFromPrevious?.changePct ?? 0),
          direction: trendDirectionToMetric(savings.trendDirection),
        },
      },
      {
        label: 'Total saved',
        value: formatMoney(savings.totalSaved),
        hint: savings.bestMonth ? `Best: ${formatMonthShort(savings.bestMonth)}` : undefined,
      },
      {
        label: 'Forecast (next)',
        value: forecast.projection.nextMonth
          ? formatMoney(forecast.projection.nextMonth.projectedSavings)
          : '—',
        hint: `${formatPercent(forecast.projection.confidencePct, 0)} confidence · ${forecast.projection.method.replace(/_/g, ' ')}`,
        trend: {
          value: formatTrendPct(forecast.trendVsHistorical.changePct),
          direction: trendDirectionToMetric(forecast.trendVsHistorical.direction),
        },
      },
    ],
    spendingPoints: spending.points.map((point) => ({
      label: formatMonthShort(point.monthKey),
      fixed: MoneyMath.toMajor(point.fixed),
      variable: MoneyMath.toMajor(point.variable),
      total: MoneyMath.toMajor(point.total),
    })),
    savingsPoints: savings.points.map((point) => ({
      label: formatMonthShort(point.monthKey),
      savings: MoneyMath.toMajor(point.savings),
      savingsRatePct: point.savingsRatePct,
    })),
    comparisonPoints: monthly.points.map((point) => ({
      label: formatMonthShort(point.monthKey),
      income: MoneyMath.toMajor(point.income),
      expenses: MoneyMath.toMajor(point.totalExpenses),
      savings: MoneyMath.toMajor(point.savings),
    })),
    forecastPoints: forecast.projection.months.map((point) => ({
      label: formatMonthShort(point.monthKey),
      projected: MoneyMath.toMajor(point.projectedSavings),
      cumulative: MoneyMath.toMajor(point.projectedCumulative),
    })),
    forecastConfidence: formatPercent(forecast.projection.confidencePct, 0),
    forecastMethod: forecast.projection.method.replace(/_/g, ' '),
    methodComparison: forecast.methodComparison.map((item) => ({
      method: item.method.replace(/_/g, ' '),
      amount: formatMoney(item.nextMonthProjected),
      confidence: formatPercent(item.confidencePct, 0),
    })),
  };
}

export function isAnalyticsEmpty(data: AnalyticsData): boolean {
  return (
    data.monthly.points.every(
      (p) => p.income.amountMinor === 0 && p.totalExpenses.amountMinor === 0,
    ) && data.spending.points.every((p) => p.total.amountMinor === 0)
  );
}
