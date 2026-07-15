import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';
import type { TypographyVariant } from '@/types/design-system';

const typographyVariants = cva('text-foreground', {
  variants: {
    variant: {
      display: 'text-display md:text-display-md text-balance font-semibold tracking-tight',
      h1: 'text-[1.75rem] font-semibold leading-tight tracking-tight md:text-3xl',
      h2: 'text-[1.375rem] font-semibold leading-snug md:text-2xl',
      h3: 'text-lg font-medium leading-snug md:text-xl',
      h4: 'text-base font-medium leading-snug',
      body: 'text-[0.9375rem] leading-relaxed text-foreground',
      'body-sm': 'text-[0.8125rem] leading-relaxed text-muted-foreground',
      caption: 'text-xs leading-normal text-muted-foreground mr-1',
      label: 'text-[0.8125rem] font-medium leading-none',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    muted: false,
  },
});

type TypographyElement = keyof Pick<
  React.JSX.IntrinsicElements,
  'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'label'
>;

const defaultElement: Record<TypographyVariant, TypographyElement> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  body: 'p',
  'body-sm': 'p',
  caption: 'span',
  label: 'label',
};

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
}

export function Typography({ className, variant = 'body', muted, as, ...props }: TypographyProps) {
  const Component = as ?? defaultElement[variant ?? 'body'];

  return <Component className={cn(typographyVariants({ variant, muted, className }))} {...props} />;
}
