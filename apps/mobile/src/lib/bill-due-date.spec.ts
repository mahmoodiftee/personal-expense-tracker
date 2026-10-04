import { describe, expect, it } from 'vitest';

import { buildBillReminderDate, clampDueDay } from './bill-due-date';

describe('clampDueDay', () => {
  it('clamps day 31 into February', () => {
    expect(clampDueDay(2026, 1, 31)).toBe(28);
  });

  it('keeps valid mid-month days', () => {
    expect(clampDueDay(2026, 0, 15)).toBe(15);
  });
});

describe('buildBillReminderDate', () => {
  it('uses the configured local hour', () => {
    const date = buildBillReminderDate(2026, 9, 4, 9);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9);
    expect(date.getDate()).toBe(4);
    expect(date.getHours()).toBe(9);
  });
});
