import { MoneyMath, type Money } from '@finance/shared';

export function formatMoney(money: Money, locale = 'en-US'): string {
  return MoneyMath.format(money, locale);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
