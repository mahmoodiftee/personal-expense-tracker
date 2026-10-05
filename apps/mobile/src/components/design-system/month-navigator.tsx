import { formatMonthLabel, shiftMonthKey } from '@finance/client';
import type { MonthKey } from '@finance/shared';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

import { Typography } from './typography';

type MonthNavigatorProps = {
  monthKey: MonthKey;
  onChange: (month: MonthKey) => void;
};

export function MonthNavigator({ monthKey, onChange }: MonthNavigatorProps) {
  const { palette } = useTheme();

  return (
    <View className="flex-row items-center gap-1 rounded-full bg-card px-1 py-1">
      <Pressable
        accessibilityLabel="Previous month"
        onPress={() => onChange(shiftMonthKey(monthKey, -1))}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-raised"
      >
        <ChevronLeft size={18} color={palette.foreground} />
      </Pressable>
      <Typography variant="body" className="min-w-[112px] text-center text-sm font-semibold">
        {formatMonthLabel(monthKey)}
      </Typography>
      <Pressable
        accessibilityLabel="Next month"
        onPress={() => onChange(shiftMonthKey(monthKey, 1))}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-raised"
      >
        <ChevronRight size={18} color={palette.foreground} />
      </Pressable>
    </View>
  );
}
