import { Stack } from 'expo-router';

import { ExpensesScreen } from '@/features/expenses/expenses-screen';

export default function ExpensesRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Expenses' }} />
      <ExpensesScreen />
    </>
  );
}
