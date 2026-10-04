import '../src/styles/global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/app-providers';
import { useTheme } from '@/providers/theme-provider';

function RootNavigator() {
  const { resolved } = useTheme();

  return (
    <>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen name="expenses" options={{ headerShown: true, title: 'Expenses' }} />
        <Stack.Screen name="income" options={{ headerShown: true, title: 'Income' }} />
        <Stack.Screen name="budgets" options={{ headerShown: true, title: 'Budgets' }} />
        <Stack.Screen
          name="savings-goals"
          options={{ headerShown: true, title: 'Savings goals' }}
        />
        <Stack.Screen name="insights" options={{ headerShown: true, title: 'Insights' }} />
        <Stack.Screen name="loans" options={{ headerShown: true, title: 'Loans' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
