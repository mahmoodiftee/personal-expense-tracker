import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type TypographyVariant =
  'hero' | 'display' | 'title' | 'h1' | 'h2' | 'body' | 'label' | 'caption';

type TypographyProps = TextProps & {
  variant?: TypographyVariant;
  className?: string;
};

const variantClasses: Record<TypographyVariant, string> = {
  hero: 'text-[40px] font-semibold leading-none tracking-tight text-foreground',
  display: 'text-3xl font-semibold tracking-tight text-foreground',
  title: 'text-[28px] font-semibold tracking-tight text-foreground',
  h1: 'text-2xl font-semibold tracking-tight text-foreground',
  h2: 'text-lg font-semibold text-foreground',
  body: 'text-base text-foreground',
  label: 'text-[13px] font-medium text-muted-foreground',
  caption: 'text-sm text-muted-foreground',
};

export function Typography({ variant = 'body', className, ...props }: TypographyProps) {
  return <Text className={cn(variantClasses[variant], className)} {...props} />;
}
