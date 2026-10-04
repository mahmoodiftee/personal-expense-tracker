import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { ApiBootstrap } from './api-bootstrap';
import { BillRemindersSync } from './bill-reminders-sync';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ApiBootstrap>
            <QueryProvider>
              <BillRemindersSync />
              {children}
            </QueryProvider>
          </ApiBootstrap>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
