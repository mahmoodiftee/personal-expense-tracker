/** Soft sage used when no category colour is stored. */
export const DEFAULT_CATEGORY_COLOR = '#7c8474';

/**
 * Chart / label palette tuned to the Monetra lime UI — greens, teals, ambers,
 * and warm neutrals. Avoids indigo/purple accents that clash with the shell.
 */
export const CATEGORY_COLOR_PALETTE = [
  '#84cc16', // lime
  '#0d9488', // teal
  '#f59e0b', // amber
  '#22c55e', // green
  '#ef4444', // coral red
  '#65a30d', // olive
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4d7c0f', // deep olive
  '#14b8a6', // mint
  '#ca8a04', // gold
  '#78716c', // warm stone
] as const;

/** Stable colour from category name (same name → same colour). */
export function categoryColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length]!;
}

/** Prefer a stored colour unless it is a generic / legacy default. */
export function resolveCategoryColor(name: string, storedColor?: string | null): string {
  if (
    storedColor &&
    storedColor.toLowerCase() !== DEFAULT_CATEGORY_COLOR &&
    storedColor.toLowerCase() !== '#64748b'
  ) {
    return storedColor;
  }
  return categoryColorFromName(name);
}

/**
 * Assign on-brand chart colours. Uses the themed palette so breakdowns stay
 * aligned with the lime UI even when stored category hex values are legacy.
 */
export function assignDistinctCategoryColors<T extends { name: string; color: string }>(
  items: readonly T[],
): T[] {
  if (items.length === 0) return [];

  const used = new Set<string>();

  return items.map((item, index) => {
    let color = categoryColorFromName(item.name);

    if (used.has(color.toLowerCase())) {
      let offset = 0;
      do {
        color = CATEGORY_COLOR_PALETTE[(index + offset) % CATEGORY_COLOR_PALETTE.length]!;
        offset += 1;
      } while (used.has(color.toLowerCase()) && offset < CATEGORY_COLOR_PALETTE.length);
    }

    used.add(color.toLowerCase());
    return { ...item, color };
  });
}
