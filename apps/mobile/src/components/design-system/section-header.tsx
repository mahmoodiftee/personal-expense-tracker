import { Pressable, View } from 'react-native';

import { Typography } from './typography';

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Typography variant="h2">{title}</Typography>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Typography variant="caption" className="font-semibold text-primary">
            {actionLabel}
          </Typography>
        </Pressable>
      ) : null}
    </View>
  );
}
