import { Stack } from 'expo-router';

import { IncomeScreen } from '@/features/income/income-screen';

export default function IncomeRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Income' }} />
      <IncomeScreen />
    </>
  );
}
