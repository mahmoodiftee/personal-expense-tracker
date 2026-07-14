import type { MonthKey } from '@finance/shared';

/** Current month as `YYYY-MM`. */
export function currentMonthKey(): MonthKey {
  const now = new Date();
  return formatMonthKey(now.getFullYear(), now.getMonth() + 1);
}

export function formatMonthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Shift a month key by `delta` months (negative = past). */
export function shiftMonthKey(monthKey: MonthKey, delta: number): MonthKey {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const date = new Date(year, month - 1 + delta, 1);
  return formatMonthKey(date.getFullYear(), date.getMonth() + 1);
}

/** Inclusive range ending at `to` spanning `count` months. */
export function monthRange(to: MonthKey, count: number): { from: MonthKey; to: MonthKey } {
  return { from: shiftMonthKey(to, -(count - 1)), to };
}

/** Human-readable label, e.g. "July 2026". */
export function formatMonthLabel(monthKey: MonthKey, locale = 'en-US'): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  );
}

/** Short chart axis label, e.g. "Jul". */
export function formatMonthShort(monthKey: MonthKey, locale = 'en-US'): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(year, month - 1, 1));
}
