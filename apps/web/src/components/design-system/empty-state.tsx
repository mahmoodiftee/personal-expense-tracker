'use client';

import Link from 'next/link';
import { Inbox } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EmptyStateProps } from '@/types/design-system';

import { FadeIn } from './motion';
import { Typography } from './typography';

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps & { className?: string }) {
  return (
    <FadeIn>
      <div
        role="status"
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center',
          className,
        )}
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
        <Typography variant="h3" className="mb-2">
          {title}
        </Typography>
        {description ? (
          <Typography variant="body-sm" className="mb-6 max-w-sm">
            {description}
          </Typography>
        ) : null}
        {action ? (
          action.href ? (
            <Link href={action.href} className={buttonVariants({ variant: 'outline' })}>
              {action.label}
            </Link>
          ) : (
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )
        ) : null}
      </div>
    </FadeIn>
  );
}
