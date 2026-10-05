import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/providers/theme-provider';

import { Typography } from './typography';

type ScreenHeaderProps = {
  title: string;
  right?: ReactNode;
};

export function ScreenHeader({ title, right }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();

  return (
    <View className="bg-background px-4 pb-3" style={{ paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-card"
        >
          <ChevronLeft size={20} color={palette.foreground} />
        </Pressable>
        <Typography variant="h2" className="flex-1 text-center">
          {title}
        </Typography>
        <View className="h-10 min-w-10 items-center justify-center">{right}</View>
      </View>
    </View>
  );
}
