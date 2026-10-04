/** Clamp a due day into the valid calendar range for a month (0-indexed month). */
export function clampDueDay(year: number, monthIndex: number, dueDay: number): number {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(dueDay, 1), lastDay);
}

/** Local reminder fire time for a bill due day. */
export function buildBillReminderDate(
  year: number,
  monthIndex: number,
  day: number,
  hour = 9,
): Date {
  return new Date(year, monthIndex, day, hour, 0, 0, 0);
}
