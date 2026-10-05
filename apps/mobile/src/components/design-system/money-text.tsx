import { Text } from 'react-native';

import { cn } from '@/lib/cn';
import { splitFormattedMoney } from '@/lib/money-display';

import type { TypographyVariant } from './typography';

const sizeClasses: Record<'hero' | 'display' | 'h1' | 'h2' | 'body', string> = {
  hero: 'text-[40px] font-semibold leading-none tracking-tight',
  display: 'text-3xl font-semibold tracking-tight',
  h1: 'text-2xl font-semibold tracking-tight',
  h2: 'text-lg font-semibold',
  body: 'text-base font-semibold',
};

type MoneyTextProps = {
  value: string;
  variant?: Extract<TypographyVariant, 'hero' | 'display' | 'h1' | 'h2' | 'body'>;
  tone?: 'default' | 'hero' | 'contrast';
  color?: string;
  className?: string;
};

const toneClasses = {
  default: 'text-foreground',
  hero: 'text-hero-foreground',
  contrast: 'text-contrast-foreground',
};

export function MoneyText({
  value,
  variant = 'h2',
  tone = 'default',
  color,
  className,
}: MoneyTextProps) {
  const { major, minor } = splitFormattedMoney(value);

  return (
    <Text
      className={cn('tabular-nums', sizeClasses[variant], !color && toneClasses[tone], className)}
      style={color ? { color } : undefined}
    >
      {major}
      {minor}
    </Text>
  );
}
