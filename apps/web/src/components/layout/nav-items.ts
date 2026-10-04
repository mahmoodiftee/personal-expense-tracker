import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Lightbulb,
  PiggyBank,
  Receipt,
  Sparkles,
  Target,
  Wallet,
} from 'lucide-react';

export type AppNavItem = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

/** Every app route, used by the icon rail and the mobile menu. */
export const APP_NAV_ITEMS: readonly AppNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: CalendarDays },
  { href: '/income', label: 'Income', icon: Wallet },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/insights', label: 'Insights', icon: Sparkles },
  { href: '/savings-goals', label: 'Savings goals', icon: Target },
  { href: '/design-system', label: 'Design system', icon: Lightbulb },
] as const;

/** Headline routes shown as the centered segmented pill nav. */
export const PRIMARY_NAV_ITEMS: readonly AppNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: CalendarDays },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/insights', label: 'Insights', icon: Sparkles },
] as const;

/** Icon-only rail: primary destinations on top, utilities pinned to the bottom. */
export const RAIL_NAV_ITEMS: readonly AppNavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/finance', label: 'Finance', icon: CalendarDays },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/income', label: 'Income', icon: Wallet },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
] as const;

export const RAIL_FOOTER_ITEMS: readonly AppNavItem[] = [
  { href: '/budgets', label: 'Budgets', icon: PiggyBank },
  { href: '/savings-goals', label: 'Savings goals', icon: Target },
  { href: '/design-system', label: 'Design system', icon: Lightbulb },
] as const;

export function isNavItemActive(pathname: string, href: Route): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}
