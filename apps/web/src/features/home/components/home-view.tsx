'use client';

import Link from 'next/link';
import type { Route } from 'next';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Lightbulb,
  PiggyBank,
  Receipt,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  FadeIn,
  ScaleOnHover,
  StaggerItem,
  StaggerList,
  ThemeToggle,
  Typography,
} from '@/components/design-system';
import { Container } from '@/components/design-system/container';
import { cn } from '@/lib/utils';

type NavFeature = {
  href: Route;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

const features: NavFeature[] = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    description: 'Monthly snapshot with income, expenses, savings, and forecasts.',
    icon: LayoutDashboard,
    badge: 'Start here',
  },
  {
    href: '/finance',
    title: 'Monthly finance',
    description: 'Track fixed bill payments and variable spending month by month.',
    icon: CalendarDays,
  },
  {
    href: '/analytics',
    title: 'Analytics',
    description: 'Spending trends, savings analysis, and forward-looking forecasts.',
    icon: BarChart3,
  },
  {
    href: '/insights',
    title: 'Insights',
    description: 'Rule-based alerts for spikes, budgets, unpaid bills, and more.',
    icon: Sparkles,
  },
  {
    href: '/budgets',
    title: 'Budget planning',
    description: 'Set category limits and see actual vs budget at a glance.',
    icon: PiggyBank,
  },
  {
    href: '/savings-goals',
    title: 'Savings goals',
    description: 'Define targets and track progress toward what matters.',
    icon: Target,
  },
  {
    href: '/expenses',
    title: 'Manage expenses',
    description: 'Create and edit fixed and variable expenses in one place.',
    icon: Receipt,
  },
  {
    href: '/design-system',
    title: 'Design system',
    description: 'Tokens, components, and UI patterns used across the app.',
    icon: Lightbulb,
  },
];

const highlights = [
  'Income & recurring bills',
  'Variable expense tracking',
  'Savings rate & forecasts',
  'Smart insights',
];

export function HomeView() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Finance';

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.18),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/3 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <Container
        size="wide"
        className="relative flex min-h-screen flex-col px-4 py-8 sm:px-6 lg:px-8"
      >
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            </div>
            <Typography variant="label" className="text-foreground">
              {appName}
            </Typography>
          </div>
          <ThemeToggle />
        </header>

        <FadeIn className="flex flex-1 flex-col justify-center py-10 md:py-16">
          <div className="mx-auto w-full max-w-3xl text-center lg:max-w-4xl">
            <Badge variant="secondary" className="mb-6 border border-border/60 bg-secondary/50">
              Personal finance, simplified
            </Badge>
            <Typography variant="display" className="text-balance">
              Take control of your money with clarity and confidence
            </Typography>
            <Typography
              variant="body"
              className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground md:mt-6"
            >
              Track income, fixed and variable expenses, savings goals, and budgets — with trends,
              forecasts, and insights that help you spend smarter every month.
            </Typography>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:mt-10">
              <Link href={'/dashboard' as Route} className={buttonVariants({ size: 'lg' })}>
                Open dashboard
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={'/analytics' as Route}
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                View analytics
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap items-center justify-center gap-2 md:mt-12">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <section aria-labelledby="features-heading" className="pb-8 pt-4 md:pb-12">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Typography id="features-heading" variant="h2">
                Explore the platform
              </Typography>
              <Typography variant="body-sm" className="mt-1 text-muted-foreground">
                Jump into any area — everything stays in sync across your finances.
              </Typography>
            </div>
            <Link
              href={'/finance' as Route}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              Go to monthly finance
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <StaggerList className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <StaggerItem key={feature.href}>
                <ScaleOnHover className="h-full">
                  <Link
                    href={feature.href}
                    className={cn(
                      'group flex h-full flex-col rounded-xl border border-border/80 bg-card/80 p-5',
                      'transition-colors hover:border-primary/40 hover:bg-card',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    )}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                        <feature.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      {feature.badge ? (
                        <Badge variant="success" className="shrink-0 text-[0.65rem]">
                          {feature.badge}
                        </Badge>
                      ) : null}
                    </div>
                    <Typography variant="h3" className="group-hover:text-primary">
                      {feature.title}
                    </Typography>
                    <Typography variant="body-sm" className="mt-2 flex-1 text-muted-foreground">
                      {feature.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="mt-4 inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      Open
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Typography>
                  </Link>
                </ScaleOnHover>
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        <footer className="mt-auto border-t border-border/60 py-6 text-center">
          <Typography variant="caption" className="text-muted-foreground">
            Built for single-user tracking today — multi-user auth coming in a future release.
          </Typography>
        </footer>
      </Container>
    </main>
  );
}
