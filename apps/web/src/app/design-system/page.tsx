'use client';

import Link from 'next/link';
import type { Route } from 'next';

import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  EmptyState,
  ErrorState,
  FadeIn,
  LoadingState,
  PageHeader,
  PageShell,
  ScaleOnHover,
  StatCard,
  StaggerItem,
  StaggerList,
  ThemeToggle,
  Typography,
} from '@/components/design-system';
import { ApiIntegrationDemo } from '@/features/design-system/api-integration-demo';
import { colors, spacing, typography } from '@/lib/design-tokens';

const swatches = [
  { name: 'Background', value: colors.background },
  { name: 'Surface', value: colors.surface },
  { name: 'Accent', value: colors.accent },
  { name: 'Success', value: colors.success },
  { name: 'Warning', value: colors.warning },
  { name: 'Destructive', value: colors.destructive },
];

export default function DesignSystemPage() {
  return (
    <PageShell>
      <PageHeader
        title="Design System"
        description="ChatGPT-inspired, dark-first tokens and reusable UI primitives for the finance platform."
        actions={
          <>
            <Link href="/" className={buttonVariants({ variant: 'outline' })}>
              Home
            </Link>
            <ThemeToggle />
          </>
        }
      />

      <FadeIn>
        <section aria-labelledby="colors-heading" className={spacing.stack}>
          <Typography id="colors-heading" variant="h2">
            Color system
          </Typography>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {swatches.map((swatch) => (
              <div key={swatch.name} className="space-y-2">
                <div
                  className="h-16 rounded-lg border border-border"
                  style={{ backgroundColor: swatch.value }}
                  aria-hidden="true"
                />
                <Typography variant="caption">{swatch.name}</Typography>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section aria-labelledby="type-heading" className={spacing.stack}>
          <Typography id="type-heading" variant="h2">
            Typography
          </Typography>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <Typography variant="display">Display — {typography.display.size}</Typography>
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="body">Body text for paragraphs and descriptions.</Typography>
              <Typography variant="body-sm">Secondary body for supporting copy.</Typography>
              <Typography variant="caption">Caption / metadata</Typography>
            </CardContent>
          </Card>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section aria-labelledby="components-heading" className={spacing.stack}>
          <Typography id="components-heading" variant="h2">
            Components
          </Typography>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Buttons & inputs</CardTitle>
                <CardDescription>Primary actions and form controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <Input placeholder="Search transactions…" aria-label="Search transactions" />
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="destructive">Error</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stat cards</CardTitle>
                <CardDescription>Dashboard metrics with optional trends</CardDescription>
              </CardHeader>
              <CardContent>
                <StaggerList className="grid gap-3 sm:grid-cols-2">
                  <StaggerItem>
                    <ScaleOnHover>
                      <StatCard
                        label="Monthly savings"
                        value="$1,240.00"
                        hint="vs last month"
                        trend={{ value: '+12%', direction: 'up' }}
                      />
                    </ScaleOnHover>
                  </StaggerItem>
                  <StaggerItem>
                    <ScaleOnHover>
                      <StatCard
                        label="Variable spend"
                        value="$860.50"
                        trend={{ value: '-4%', direction: 'down' }}
                      />
                    </ScaleOnHover>
                  </StaggerItem>
                </StaggerList>
              </CardContent>
            </Card>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.15}>
        <section aria-labelledby="states-heading" className={spacing.stack}>
          <Typography id="states-heading" variant="h2">
            Loading, error & empty states
          </Typography>
          <div className="grid gap-4 lg:grid-cols-3">
            <LoadingState label="Loading transactions…" rows={3} />
            <ErrorState message="Network request failed." onRetry={() => undefined} />
            <EmptyState
              title="No data"
              description="Start by adding your first recurring income source."
              action={{ label: 'Get started', href: '/design-system' as Route }}
            />
          </div>
        </section>
      </FadeIn>

      <Separator />

      <ApiIntegrationDemo />
    </PageShell>
  );
}
