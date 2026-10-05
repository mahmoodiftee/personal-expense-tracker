import { Pressable } from 'react-native';

import { Typography } from '@/components/design-system';
import { cn } from '@/lib/cn';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('rounded-full bg-card px-3.5 py-2', selected && 'bg-primary')}
    >
      <Typography
        variant="caption"
        className={cn('font-semibold', selected ? 'text-primary-foreground' : 'text-foreground')}
      >
        {label}
      </Typography>
    </Pressable>
  );
}
