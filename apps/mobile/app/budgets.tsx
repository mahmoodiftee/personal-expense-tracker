import { Stack } from 'expo-router';

import { BudgetsScreen } from '@/features/budgets/budgets-screen';

export default function BudgetsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Budgets' }} />
      <BudgetsScreen />
    </>
  );
}
