import { Pressable, View } from 'react-native';

import { Typography } from '@/components/design-system';
import { cn } from '@/lib/cn';

type Option<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-full bg-card p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn('flex-1 items-center rounded-full px-3 py-2', selected && 'bg-raised')}
          >
            <Typography
              variant="caption"
              className={cn(
                'font-semibold',
                selected ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
  );
}
