import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

type IconChipProps = {
  icon: LucideIcon;
  color?: string;
  background?: string;
  size?: number;
  iconSize?: number;
  rounded?: 'full' | 'xl';
};

export function IconChip({
  icon: Icon,
  color,
  background,
  size = 40,
  iconSize = 18,
  rounded = 'full',
}: IconChipProps) {
  const { palette } = useTheme();

  return (
    <View
      className={cn(
        'items-center justify-center',
        rounded === 'full' ? 'rounded-full' : 'rounded-xl',
      )}
      style={{
        height: size,
        width: size,
        backgroundColor: background ?? `${palette.primary}22`,
      }}
    >
      <Icon size={iconSize} color={color ?? palette.primary} />
    </View>
  );
}
