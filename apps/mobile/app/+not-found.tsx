import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { Typography } from '@/components/design-system';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <Typography variant="h1">Screen not found</Typography>
        <Link href="/">
          <Typography variant="body" className="text-primary">
            Go home
          </Typography>
        </Link>
      </View>
    </>
  );
}
