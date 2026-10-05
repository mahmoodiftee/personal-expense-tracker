import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Card, CardContent, type CardVariant } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

import { IconChip } from './icon-chip';
import { MoneyText } from './money-text';
import { Typography } from './typography';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  variant?: CardVariant;
  className?: string;
};

export function StatCard({
  label,
  value,
  caption,
  icon: Icon,
  iconColor,
  iconBackground,
  variant = 'default',
  className,
}: StatCardProps) {
  const { palette, resolved } = useTheme();
  const onAccent = variant === 'accent';
  const onContrast = variant === 'contrast';
  const accentChip = resolved === 'dark' ? '#000000' : '#FFFFFF';
  const accentIcon = resolved === 'dark' ? '#FFFFFF' : '#000000';
  const ink = onContrast ? palette.contrastForeground : onAccent ? '#FFFFFF' : undefined;

  return (
    <Card variant={variant} className={cn('flex-1', className)}>
      <CardContent className="gap-6 py-5">
        <View className="flex-row items-center gap-2.5">
          {Icon ? (
            <IconChip
              icon={Icon}
              color={iconColor ?? (onAccent ? accentIcon : ink) ?? palette.primary}
              background={iconBackground ?? (onAccent ? accentChip : undefined)}
              size={36}
              iconSize={16}
            />
          ) : null}
          <Typography
            variant="body"
            className="font-semibold"
            style={ink ? { color: ink } : undefined}
          >
            {label}
          </Typography>
        </View>
        <View className="gap-1">
          <MoneyText value={value} variant="display" color={ink} />
          {caption ? (
            <Typography variant="caption" style={ink ? { color: ink, opacity: 0.65 } : undefined}>
              {caption}
            </Typography>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
