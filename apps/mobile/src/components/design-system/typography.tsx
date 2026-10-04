import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

type TypographyVariant = 'h1' | 'h2' | 'body' | 'label' | 'caption' | 'display';

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  className?: string;
};

const variantClasses: Record<TypographyVariant, string> = {
  display: 'text-3xl font-semibold tracking-tight text-foreground',
  h1: 'text-2xl font-semibold tracking-tight text-foreground',
  h2: 'text-lg font-semibold text-foreground',
  body: 'text-base text-foreground',
  label: 'text-xs font-semibold uppercase tracking-wide text-muted-foreground',
  caption: 'text-sm text-muted-foreground',
};

export function Typography({ variant = 'body', className, ...props }: TypographyProps) {
  return <Text className={cn(variantClasses[variant], className)} {...props} />;
}
