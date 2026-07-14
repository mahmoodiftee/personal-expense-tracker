import Link from 'next/link';
import type { Route } from 'next';

import { buttonVariants } from '@/components/ui/button';
import { Container, PageHeader, Typography } from '@/components/design-system';
import { spacing } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <main className={cn('min-h-screen', spacing.pageY)}>
      <Container>
        <PageHeader
          title="Personal Finance"
          description="Track income, fixed and variable expenses, savings, and forecasts in one place."
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href={'/dashboard' as Route} className={buttonVariants()}>
                Open dashboard
              </Link>
              <Link href={'/finance' as Route} className={buttonVariants({ variant: 'secondary' })}>
                Monthly finance
              </Link>
              <Link
                href={'/analytics' as Route}
                className={buttonVariants({ variant: 'secondary' })}
              >
                Analytics
              </Link>
              <Link href={'/budgets' as Route} className={buttonVariants({ variant: 'secondary' })}>
                Budget planning
              </Link>
              <Link
                href={'/savings-goals' as Route}
                className={buttonVariants({ variant: 'secondary' })}
              >
                Savings goals
              </Link>
              <Link
                href={'/expenses' as Route}
                className={buttonVariants({ variant: 'secondary' })}
              >
                Manage expenses
              </Link>
              <Link
                href={'/design-system' as Route}
                className={buttonVariants({ variant: 'outline' })}
              >
                Design system
              </Link>
            </div>
          }
        />
        <Typography variant="body-sm" className="mt-8 text-muted-foreground">
          Manage expenses, track monthly payments, or explore analytics for trends and forecasts.
        </Typography>
      </Container>
    </main>
  );
}
