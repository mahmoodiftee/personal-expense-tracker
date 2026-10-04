import { Pressable, Text, type PressableProps } from 'react-native';

import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  className?: string;
  labelClassName?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  ghost: 'bg-transparent',
  destructive: 'bg-destructive',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
};

export function Button({
  label,
  variant = 'primary',
  className,
  labelClassName,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={cn(
        'items-center justify-center rounded-full px-4 py-3',
        variantClasses[variant],
        disabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      <Text className={cn('text-sm font-semibold', labelClasses[variant], labelClassName)}>
        {label}
      </Text>
    </Pressable>
  );
}
