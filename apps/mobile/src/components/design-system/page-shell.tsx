import { RefreshControl, ScrollView, View, type RefreshControlProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';
import { tabBarClearance } from '@/lib/layout';

type PageShellProps = {
  children: ReactNode;
  className?: string;
  refreshing?: boolean;
  onRefresh?: RefreshControlProps['onRefresh'];
  footer?: ReactNode;
  /** Full-bleed block rendered above the padded scroll content (lime hero). */
  hero?: ReactNode;
  /** Sticky header above the scroll (back row on stack screens). */
  header?: ReactNode;
  /** When false, skip top safe-area padding (use under a stack header or hero). */
  safeTop?: boolean;
  /** Extra room for the floating tab bar. Defaults to true. */
  tabBarInset?: boolean;
};

export function PageShell({
  children,
  className,
  refreshing = false,
  onRefresh,
  footer,
  hero,
  header,
  safeTop = true,
  tabBarInset = true,
}: PageShellProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = tabBarInset ? tabBarClearance(insets.bottom) : 32;
  const topPad = !hero && !header && safeTop ? insets.top : 0;

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: topPad }}>
      {hero}
      {header}
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn('gap-4 px-4 pt-4', className)}
        contentContainerStyle={{ paddingBottom: footer ? 16 : bottomPad }}
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
