import { View } from 'react-native';

import { Button } from '@/components/ui/button';

import { Typography } from './typography';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-card bg-card p-6">
      <Typography variant="h2">{title}</Typography>
      <Typography variant="caption" className="text-center">
        {description}
      </Typography>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2 min-w-[140px]" />
      ) : null}
    </View>
  );
}
