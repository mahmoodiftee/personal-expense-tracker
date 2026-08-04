/** Default slate used when no category colour is stored. */
export const DEFAULT_CATEGORY_COLOR = '#64748b';

/** Distinct palette for charts and category labels. */
export const CATEGORY_COLOR_PALETTE = [
  '#6366f1',
  '#22c55e',
  '#f97316',
  '#ec4899',
  '#14b8a6',
  '#eab308',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#a855f7',
  '#0ea5e9',
] as const;

/** Stable colour from category name (same name → same colour). */
export function categoryColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length]!;
}

/** Prefer a stored colour unless it is the generic default. */
export function resolveCategoryColor(name: string, storedColor?: string | null): string {
  if (storedColor && storedColor.toLowerCase() !== DEFAULT_CATEGORY_COLOR) {
    return storedColor;
  }
  return categoryColorFromName(name);
}

/** Ensure each row in a breakdown gets a unique chart colour when duplicates exist. */
export function assignDistinctCategoryColors<T extends { name: string; color: string }>(
  items: readonly T[],
): T[] {
  if (items.length <= 1) return [...items];

  const uniqueStored = new Set(items.map((item) => item.color.toLowerCase()));
  if (uniqueStored.size === items.length) return [...items];

  return items.map((item, index) => ({
    ...item,
    color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length]!,
  }));
}
