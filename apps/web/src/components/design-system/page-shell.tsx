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

/** Standard page canvas: vertical page rhythm + centered content column. */
export function PageShell({
  children,
  footer,
  className,
  containerClassName,
  size = 'default',
  ...mainProps
}: PageShellProps) {
  return (
    <main className={cn('min-h-screen py-6 md:py-8', className)} {...mainProps}>
      <Container className={cn('space-y-6 md:space-y-8', containerClassName)} size={size}>
        {children}
      </Container>
      {footer}
    </main>
  );
}
