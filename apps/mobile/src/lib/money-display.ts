/** Split a formatted amount like `৳8,022.00` so cents can render muted. */
export function splitFormattedMoney(value: string): { major: string; minor: string } {
  const match = value.match(/^(.*?)([.,]\d{2})$/);
  if (!match) {
    return { major: value, minor: '' };
  }
  return { major: match[1] ?? value, minor: match[2] ?? '' };
}
