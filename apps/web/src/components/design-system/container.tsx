import { cn } from '@/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'default' | 'narrow' | 'wide' | 'full';
  /** Set false when an ancestor (e.g. the app shell) already applies gutters. */
  padded?: boolean;
};

const sizeClasses = {
  default: 'max-w-5xl',
  narrow: 'max-w-2xl',
  wide: 'max-w-7xl',
  full: 'max-w-none',
};

export function Container({
  className,
  size = 'default',
  padded = true,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        padded && 'px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
