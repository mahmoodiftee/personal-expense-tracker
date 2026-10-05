import {
  Car,
  Coins,
  CreditCard,
  Footprints,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';

/** Stored category icon keys. A generic "tag" falls through to the title. */
const ICONS_BY_KEY: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'shopping-bag': ShoppingBag,
  utensils: Utensils,
  car: Car,
  home: Home,
  coins: Coins,
  landmark: Landmark,
  'graduation-cap': GraduationCap,
  footprints: Footprints,
  wifi: Wifi,
  heart: Heart,
  'credit-card': CreditCard,
};

const GENERIC_KEYS = new Set(['', 'tag', 'circle']);

/** Title patterns, most specific first. */
const TITLE_RULES: { test: RegExp; icon: LucideIcon }[] = [
  { test: /\b(shoe|shoes|footwear)\b/i, icon: Footprints },
  { test: /\b(loan|emi|mortgage|debt)\b/i, icon: Landmark },
  { test: /\b(semester|tuition|school|college|university|education)\b/i, icon: GraduationCap },
  { test: /\b(grocery|groceries|food|restaurant|dining|meal)\b/i, icon: Utensils },
  { test: /\b(rent|house|home|maid|apartment)\b/i, icon: Home },
  { test: /\b(wifi|wi-fi|internet|broadband|phone|mobile)\b/i, icon: Wifi },
  { test: /\b(car|fuel|transport|uber|taxi|bus)\b/i, icon: Car },
  { test: /\b(health|medical|hospital|pharmacy|doctor)\b/i, icon: Heart },
  { test: /\b(shopping|clothes|clothing|apparel)\b/i, icon: ShoppingBag },
  { test: /\b(credit)\b/i, icon: CreditCard },
];

/**
 * Icon for a category row. Prefers the icon stored on the category, then
 * matches the title so a name like "Shoe" is not assigned a random glyph.
 */
export function iconForCategory(name: string, iconKey?: string | null): LucideIcon {
  const key = iconKey?.trim().toLowerCase() ?? '';
  if (!GENERIC_KEYS.has(key) && ICONS_BY_KEY[key]) {
    return ICONS_BY_KEY[key];
  }

  const match = TITLE_RULES.find((rule) => rule.test.test(name));
  return match?.icon ?? Tag;
}
