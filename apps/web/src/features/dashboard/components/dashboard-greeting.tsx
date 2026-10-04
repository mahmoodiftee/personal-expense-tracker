'use client';

import { Search } from 'lucide-react';

import { Typography } from '@/components/design-system';

/** Time-of-day greeting matching the user's local clock. */
function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

type DashboardGreetingProps = {
  /** Month navigation and other controls, rendered on the trailing edge. */
  actions?: React.ReactNode;
};

export function DashboardGreeting({ actions }: DashboardGreetingProps) {
  const greeting = greetingFor(new Date());

  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <Typography variant="h1">{greeting}</Typography>
        <Typography variant="body-sm">
          Stay on top of your income, expenses, and savings for the month.
        </Typography>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search"
            aria-label="Search"
            className="h-10 w-full rounded-full bg-card pl-10 pr-4 text-sm shadow-card placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-56"
          />
        </div>
        {actions}
      </div>
    </header>
  );
}
