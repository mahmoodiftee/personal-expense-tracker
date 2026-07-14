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
            <Link href={'/design-system' as Route} className={buttonVariants()}>
              View design system
            </Link>
          }
        />
        <Typography variant="body-sm" className="mt-8 text-muted-foreground">
          Dashboard coming soon. Explore the design system to preview tokens, components, and API
          patterns.
        </Typography>
      </Container>
    </main>
  );
}
