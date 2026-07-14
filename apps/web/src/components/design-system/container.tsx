import { cn } from '@/lib/utils';
import { spacing } from '@/lib/design-tokens';

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'default' | 'narrow' | 'wide';
};

const sizeClasses = {
  default: 'max-w-5xl',
  narrow: 'max-w-2xl',
  wide: 'max-w-7xl',
};

export function Container({ className, size = 'default', ...props }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full', spacing.pageX, sizeClasses[size], className)} {...props} />
  );
}
