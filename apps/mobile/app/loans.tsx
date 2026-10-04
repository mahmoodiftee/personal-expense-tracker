import { Stack } from 'expo-router';

import { LoansScreen } from '@/features/loans/loans-screen';

export default function LoansRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Loans' }} />
      <LoansScreen />
    </>
  );
}
