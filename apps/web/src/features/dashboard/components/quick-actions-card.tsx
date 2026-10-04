import Link from 'next/link';
import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownLeft, ArrowUpRight, CalendarCheck, PiggyBank, Target } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Typography } from '@/components/design-system';
import { cn } from '@/lib/utils';

type QuickAction = {
  href: Route;
  label: string;
  icon: LucideIcon;
};

const PRIMARY_ACTIONS: readonly QuickAction[] = [
  { href: '/expenses' as Route, label: 'Add expense', icon: ArrowUpRight },
  { href: '/income' as Route, label: 'Add income', icon: ArrowDownLeft },
] as const;

const SECONDARY_ACTIONS: readonly QuickAction[] = [
  { href: '/finance' as Route, label: 'Pay bills', icon: CalendarCheck },
  { href: '/budgets' as Route, label: 'Budgets', icon: PiggyBank },
  { href: '/savings-goals' as Route, label: 'Goals', icon: Target },
] as const;

export function QuickActionsCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="space-y-3 p-4 md:p-5">
        <Typography variant="label" as="p">
          Quick actions
        </Typography>

        <div className="grid grid-cols-2 gap-2">
          {PRIMARY_ACTIONS.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.label === 'Add expense';
            return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isPrimary
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-foreground hover:bg-accent',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {action.label}
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SECONDARY_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-muted/60 px-2 py-3 text-center transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="w-full truncate text-xs font-medium">{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
