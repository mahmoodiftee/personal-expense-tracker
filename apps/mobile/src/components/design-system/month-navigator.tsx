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
  const { resolved } = useTheme();
  const iconColor = resolved === 'dark' ? '#EDEDED' : '#1A1A1F';

  return (
    <View className="flex-row items-center gap-2 rounded-full border border-border bg-card px-1 py-1">
      <Pressable
        accessibilityLabel="Previous month"
        onPress={() => onChange(shiftMonthKey(monthKey, -1))}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
      >
        <ChevronLeft size={18} color={iconColor} />
      </Pressable>
      <Typography variant="body" className="min-w-[120px] text-center text-sm font-semibold">
        {formatMonthLabel(monthKey)}
      </Typography>
      <Pressable
        accessibilityLabel="Next month"
        onPress={() => onChange(shiftMonthKey(monthKey, 1))}
        className="h-9 w-9 items-center justify-center rounded-full active:bg-muted"
      >
        <ChevronRight size={18} color={iconColor} />
      </Pressable>
    </View>
  );
}
