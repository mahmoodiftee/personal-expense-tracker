import { Stack } from 'expo-router';

import { InsightsScreen } from '@/features/insights/insights-screen';

export default function InsightsRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Insights' }} />
      <InsightsScreen />
    </>
  );
}
