import { MoneyMath, type DashboardOverview, type DashboardMonthlyOverview } from '@finance/shared';

import { formatMoney, formatPercent } from '@/lib/format-money';
import { formatMonthLabel, formatMonthShort } from '@/lib/month';

import { formatForecastMethod } from '../lib/paths';
import { computePercentTrend, findPriorMonthItem } from '../lib/trends';
import type { DashboardViewModel } from '../types';

export function mapDashboardToViewModel(
  overview: DashboardOverview,
  trends: DashboardMonthlyOverview,
): DashboardViewModel {
  const { snapshot, forecast, categoryBreakdown } = overview;
  const prior = findPriorMonthItem(trends.months, snapshot.monthKey);

  const incomeMajor = MoneyMath.toMajor(snapshot.totalIncome);
  const expenseMajor = MoneyMath.toMajor(snapshot.totalExpenses);
  const savingsMajor = MoneyMath.toMajor(snapshot.savings.amount);

  const priorIncome = prior ? MoneyMath.toMajor(prior.totalIncome) : undefined;
  const priorExpense = prior ? MoneyMath.toMajor(prior.totalExpenses) : undefined;
  const priorSavings = prior ? MoneyMath.toMajor(prior.savings) : undefined;

  return {
    monthKey: snapshot.monthKey,
    monthLabel: formatMonthLabel(snapshot.monthKey),
    income: formatMoney(snapshot.totalIncome),
    expenses: formatMoney(snapshot.totalExpenses),
    savings: formatMoney(snapshot.savings.amount),
    savingsRate: formatPercent(snapshot.savings.ratePct),
    expenseFixed: formatMoney(snapshot.expenseBreakdown.fixed),
    expenseVariable: formatMoney(snapshot.expenseBreakdown.variable),
    forecastAmount: forecast.nextMonth ? formatMoney(forecast.nextMonth.projectedSavings) : null,
    forecastConfidence: forecast.nextMonth ? formatPercent(forecast.confidencePct, 0) : null,
    forecastMethod: formatForecastMethod(forecast.method),
    incomeTrend: computePercentTrend(incomeMajor, priorIncome),
    expenseTrend: computePercentTrend(expenseMajor, priorExpense),
    savingsTrend: computePercentTrend(savingsMajor, priorSavings),
    chartPoints: trends.months.map((item) => ({
      monthKey: item.monthKey,
      label: formatMonthShort(item.monthKey),
      income: MoneyMath.toMajor(item.totalIncome),
      expenses: MoneyMath.toMajor(item.totalExpenses),
      savings: MoneyMath.toMajor(item.savings),
      savingsRatePct: item.savingsRatePct,
    })),
    categoryBreakdown: categoryBreakdown.map((item) => ({
      name: item.name,
      color: item.color,
      total: formatMoney(item.total),
      sharePct: item.sharePct,
    })),
  };
}
