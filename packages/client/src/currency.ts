import { CurrencyCode, MoneyMath, type Money } from '@finance/shared';

/** ISO currency stored on records; UI always displays the ৳ symbol instead. */
export const APP_CURRENCY = CurrencyCode.BDT;

/** Locale used for grouping thousands in amount strings. */
export const APP_LOCALE = 'en-BD';

export const TAKA_SYMBOL = '৳';

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
