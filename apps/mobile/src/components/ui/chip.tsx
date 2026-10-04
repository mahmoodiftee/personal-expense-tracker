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
      className={cn(
        'rounded-full border border-border px-3 py-2',
        selected && 'border-primary bg-primary/20',
      )}
    >
      <Typography variant="caption" className="text-foreground">
        {label}
      </Typography>
    </Pressable>
  );
}
