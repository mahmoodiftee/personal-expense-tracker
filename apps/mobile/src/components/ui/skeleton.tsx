import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export function Skeleton({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('animate-pulse rounded-xl bg-muted', className)} {...props} />;
}
