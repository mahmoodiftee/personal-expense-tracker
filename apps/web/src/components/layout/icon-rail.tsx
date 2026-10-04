'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { RAIL_FOOTER_ITEMS, RAIL_NAV_ITEMS, isNavItemActive, type AppNavItem } from './nav-items';

function RailLink({ item, active }: { item: AppNavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      title={item.label}
      className={cn(
        'group relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </Link>
  );
}

/**
 * Floating icon-only navigation rail. Visible from `lg` up; smaller screens use
 * the mobile menu in {@link AppNav} instead.
 */
export function IconRail() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Quick navigation"
      className="sticky top-24 hidden h-[calc(100vh-7rem)] shrink-0 lg:block"
    >
      <nav className="flex h-full max-h-[34rem] flex-col items-center justify-between rounded-[2rem] bg-card/70 p-2 shadow-card backdrop-blur-xl">
        <ul className="flex flex-col items-center gap-1">
          {RAIL_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={isNavItemActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        <ul className="flex flex-col items-center gap-1">
          {RAIL_FOOTER_ITEMS.map((item) => (
            <li key={item.href}>
              <RailLink item={item} active={isNavItemActive(pathname, item.href)} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
