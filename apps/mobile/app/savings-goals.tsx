import { Stack } from 'expo-router';

import { SavingsGoalsScreen } from '@/features/savings-goals/savings-goals-screen';

export default function SavingsGoalsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Savings goals' }} />
      <SavingsGoalsScreen />
    </>
  );
}
