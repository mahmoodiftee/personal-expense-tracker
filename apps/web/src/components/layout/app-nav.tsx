'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { Bell, Menu, Settings, Sparkles, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ThemeToggle } from '@/components/design-system';
import { cn } from '@/lib/utils';

import { APP_NAV_ITEMS, PRIMARY_NAV_ITEMS, isNavItemActive } from './nav-items';
import { ShellFrame } from './shell-frame';

const iconButtonClasses =
  'flex h-10 w-10 items-center justify-center rounded-full bg-card/70 text-muted-foreground shadow-card backdrop-blur-xl transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function AppNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Finance';

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/40 backdrop-blur-xl">
      {/*
        Three zones live inside the shared 8xl shell — logo and icons only
        stretch as far as that band, never the full viewport.
      */}
      <ShellFrame className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Link
          href={'/' as Route}
          className="flex w-fit shrink-0 items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight sm:inline">{appName}</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-1 rounded-full bg-card/70 p-1.5 shadow-card backdrop-blur-xl lg:flex"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button type="button" className={iconButtonClasses} aria-label="Notifications">
            <Bell className="h-[18px] w-[18px]" />
          </button>
          <Link
            href={'/budgets' as Route}
            className={cn(iconButtonClasses, 'hidden sm:flex')}
            aria-label="Budget settings"
          >
            <Settings className="h-[18px] w-[18px]" />
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className={cn(iconButtonClasses, 'lg:hidden')}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </ShellFrame>

      {mobileOpen ? (
        <ShellFrame className="pb-2 lg:hidden">
          <nav
            id="mobile-nav-panel"
            aria-label="Mobile navigation"
            className="rounded-card bg-card p-3 shadow-card"
          >
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {APP_NAV_ITEMS.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </ShellFrame>
      ) : null}
    </header>
  );
}
