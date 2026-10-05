import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export type CardVariant = 'default' | 'raised' | 'accent' | 'contrast';

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-card',
  raised: 'bg-raised',
  accent: 'bg-hero',
  contrast: 'bg-contrast',
};

type CardProps = ViewProps & {
  className?: string;
  variant?: CardVariant;
};

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return <View className={cn('rounded-card', variantClasses[variant], className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('p-4', className)} {...props} />;
}
