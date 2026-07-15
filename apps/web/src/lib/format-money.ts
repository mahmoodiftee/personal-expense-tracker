import { MoneyMath, type Money } from '@finance/shared';

import { APP_LOCALE, TAKA_SYMBOL } from './currency-config';

type TakaFormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
};

/** Always renders amounts with the ৳ symbol (never the BDT code). */
export function formatTakaAmount(amountMajor: number, options: TakaFormatOptions = {}): string {
  const { minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
  const formatted = amountMajor.toLocaleString(APP_LOCALE, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `${TAKA_SYMBOL}${formatted}`;
}

export function formatMoney(money: Money): string {
  return formatTakaAmount(MoneyMath.toMajor(money));
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
