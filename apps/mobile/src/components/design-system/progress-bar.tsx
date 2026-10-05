import { View } from 'react-native';

import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/theme-provider';

type ProgressBarProps = {
  value: number;
  color?: string;
  className?: string;
};

export function ProgressBar({ value, color, className }: ProgressBarProps) {
  const { palette } = useTheme();
  const width = Math.min(100, Math.max(0, value));

  return (
    <View className={cn('h-1.5 overflow-hidden rounded-full bg-chart-track', className)}>
      <View
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: color ?? palette.primary }}
      />
    </View>
  );
}
