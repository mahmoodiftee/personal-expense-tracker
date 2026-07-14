import type { MonthKey } from '@finance/shared';
import { MONTH_KEY_REGEX } from '../validation/is-month-key';

/**
 * Pure helpers for working with `YYYY-MM` month keys. String comparison of
 * zero-padded keys is chronological, which the range/compare helpers rely on.
 */

export function isValidMonthKey(value: string): value is MonthKey {
  return MONTH_KEY_REGEX.test(value);
}

/** The `MonthKey` (UTC) a given date falls into. */
export function monthKeyFromDate(date: Date): MonthKey {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
}

/** Current month in UTC as a `MonthKey`. */
export function currentMonthKey(now: Date = new Date()): MonthKey {
  return monthKeyFromDate(now);
}

function splitMonthKey(monthKey: MonthKey): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number);
  return { year: year as number, month: month as number };
}

/** Offset a month key by `delta` months (may be negative). */
export function shiftMonthKey(monthKey: MonthKey, delta: number): MonthKey {
  const { year, month } = splitMonthKey(monthKey);
  const zeroBased = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(zeroBased / 12);
  const newMonth = (zeroBased % 12) + 1;
  return `${newYear}-${`${newMonth}`.padStart(2, '0')}`;
}

export function previousMonthKey(monthKey: MonthKey): MonthKey {
  return shiftMonthKey(monthKey, -1);
}

/** -1 | 0 | 1 comparison (chronological). */
export function compareMonthKeys(a: MonthKey, b: MonthKey): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Whether `monthKey` falls within [start, end] inclusive. */
export function isMonthInRange(monthKey: MonthKey, start: MonthKey, end: MonthKey): boolean {
  return monthKey >= start && monthKey <= end;
}

/** Inclusive list of month keys from `from` to `to` (empty if from > to). */
export function monthKeyRange(from: MonthKey, to: MonthKey, maxMonths = 120): MonthKey[] {
  if (from > to) return [];
  const result: MonthKey[] = [];
  let cursor = from;
  while (cursor <= to && result.length < maxMonths) {
    result.push(cursor);
    cursor = shiftMonthKey(cursor, 1);
  }
  return result;
}
