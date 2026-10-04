import { RefreshControl, ScrollView, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type PageShellProps = {
  children: ReactNode;
  className?: string;
  refreshing?: boolean;
  onRefresh?: RefreshControlProps['onRefresh'];
  footer?: ReactNode;
  /** When false, skip top safe-area padding (use under a stack header). */
  safeTop?: boolean;
};

export function PageShell({
  children,
  className,
  refreshing = false,
  onRefresh,
  footer,
  safeTop = true,
}: PageShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeTop ? insets.top : 0 }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn('gap-4 px-4 pb-8 pt-2', className)}
        refreshControl={
          onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined
        }
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}
