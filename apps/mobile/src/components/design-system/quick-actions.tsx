import type { LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

import { Typography } from './typography';

export type QuickActionItem = {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
};

type QuickActionsProps = {
  items: QuickActionItem[];
};

export function QuickActions({ items }: QuickActionsProps) {
  const { palette } = useTheme();

  return (
    <View className="flex-row gap-3">
      {items.map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          className="flex-1 items-center gap-2 rounded-tile bg-raised py-4"
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-card">
            <item.icon size={18} color={palette.foreground} />
          </View>
          <Typography variant="caption" className="text-center text-xs text-foreground">
            {item.label}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
}
