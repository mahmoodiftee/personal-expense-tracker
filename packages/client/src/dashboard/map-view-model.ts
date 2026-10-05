import {
  MoneyMath,
  assignDistinctCategoryColors,
  type DashboardOverview,
  type DashboardMonthlyOverview,
} from '@finance/shared';

import { formatMoney, formatPercent } from '../currency';
import { formatMonthLabel, formatMonthShort } from '../month';
import { formatForecastMethod } from './paths';
import { computePercentTrend, findPriorMonthItem } from './trends';

export type DashboardChartPoint = {
  monthKey: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRatePct: number;
};

export type DashboardCategorySlice = {
  name: string;
  color: string;
  icon: string;
  total: string;
  sharePct: number;
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
  incomeTrend: ReturnType<typeof computePercentTrend>;
  expenseTrend: ReturnType<typeof computePercentTrend>;
  savingsTrend: ReturnType<typeof computePercentTrend>;
  chartPoints: DashboardChartPoint[];
  categoryBreakdown: DashboardCategorySlice[];
};

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
    categoryBreakdown: assignDistinctCategoryColors(
      categoryBreakdown.map((item) => ({
        name: item.name,
        color: item.color,
        icon: item.icon,
        total: formatMoney(item.total),
        sharePct: item.sharePct,
      })),
    ),
  };
}
