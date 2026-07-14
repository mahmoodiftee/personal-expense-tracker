/** Round to 2 decimal places (percentages, sharePct, rates). */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
