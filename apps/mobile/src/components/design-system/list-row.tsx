import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

import { IconChip } from './icon-chip';
import { MoneyText } from './money-text';
import { Typography } from './typography';

type ListRowProps = {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBackground?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  className?: string;
};

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  iconColor,
  iconBackground,
  onPress,
  trailing,
  className,
}: ListRowProps) {
  const { palette } = useTheme();
  const content = (
    <View
      className={cn('flex-row items-center gap-3 rounded-tile bg-card px-3.5 py-3.5', className)}
    >
      {icon ? <IconChip icon={icon} color={iconColor} background={iconBackground} /> : null}
      <View className="min-w-0 flex-1">
        <Typography variant="body" className="font-semibold">
          {title}
        </Typography>
        {subtitle ? <Typography variant="caption">{subtitle}</Typography> : null}
      </View>
      {value ? <MoneyText value={value} variant="body" /> : null}
      {trailing}
      {onPress && !trailing ? <ChevronRight size={18} color={palette.mutedForeground} /> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
