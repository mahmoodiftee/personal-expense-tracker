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
          Your dashboard shows income, expenses, savings, forecasts, and multi-month trends.
        </Typography>
      </Container>
    </main>
  );
}
