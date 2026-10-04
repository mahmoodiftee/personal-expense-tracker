import { cn } from '@/lib/utils';

import { Container } from './container';

type PageShellProps = React.ComponentPropsWithoutRef<'main'> & {
  children: React.ReactNode;
  /** Rendered after the container (e.g. mobile sticky footer). */
  footer?: React.ReactNode;
  /** Extra classes on the inner `Container`. */
  containerClassName?: string;
  size?: React.ComponentProps<typeof Container>['size'];
};

/**
 * Standard page canvas. Horizontal gutters come from the app shell, so the
 * container only owns the max width and vertical rhythm.
 */
export function PageShell({
  children,
  footer,
  className,
  containerClassName,
  // Fill the shell band — max width is owned by `ShellFrame`, not a nested container.
  size = 'full',
  ...mainProps
}: PageShellProps) {
  return (
    <main className={cn('pb-6 md:pb-8', className)} {...mainProps}>
      <Container
        className={cn('space-y-4 md:space-y-6', containerClassName)}
        size={size}
        padded={false}
      >
        {children}
      </Container>
      {footer}
    </main>
  );
}
