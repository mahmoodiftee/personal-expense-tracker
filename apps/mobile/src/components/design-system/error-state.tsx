import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Typography } from './typography';

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <View className="items-center gap-3 rounded-card border border-border bg-card p-6">
      <Typography variant="h2">{title}</Typography>
      <Typography variant="caption" className="text-center">
        {message}
      </Typography>
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} className="mt-2 min-w-[140px]" />
      ) : null}
    </View>
  );
}
