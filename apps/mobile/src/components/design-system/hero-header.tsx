import { Settings } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/lib/profile';
import { useTheme } from '@/providers/theme-provider';

import { MoneyText } from './money-text';
import { Typography } from './typography';

type HeroHeaderProps = {
  eyebrow: string;
  value: string;
  chip?: string;
  rightAction?: ReactNode;
  onRightPress?: () => void;
  children?: ReactNode;
};

export function HeroHeader({
  eyebrow,
  value,
  chip,
  rightAction,
  onRightPress,
  children,
}: HeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const { palette } = useTheme();
  const heroInk = palette.heroForeground;

  return (
    <View className="overflow-hidden rounded-b-hero bg-hero" style={{ paddingTop: insets.top + 8 }}>
      <View className="gap-6 px-5 pb-7 pt-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {profile.avatarUrl ? (
              <View className="h-11 w-11 overflow-hidden rounded-full">
                <Image source={{ uri: profile.avatarUrl }} className="h-11 w-11" />
              </View>
            ) : null}
            <View>
              <Typography variant="caption" style={{ color: heroInk }}>
                Hello
              </Typography>
              <Typography variant="h2" className="capitalize" style={{ color: heroInk }}>
                {profile.name}
              </Typography>
            </View>
          </View>
          {rightAction ?? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={onRightPress}
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: '#000000' }}
            >
              <Settings size={18} color="#FFFFFF" />
            </Pressable>
          )}
        </View>

        <View className="gap-1.5">
          <Typography variant="label" style={{ color: heroInk }}>
            {eyebrow}
          </Typography>
          <View className="flex-row flex-wrap items-end gap-2">
            <MoneyText value={value} variant="hero" color={heroInk} />
            {chip ? (
              <View
                className="mb-1 rounded-full px-2.5 py-1"
                style={{ backgroundColor: '#000000' }}
              >
                <Typography
                  variant="caption"
                  className="text-xs font-semibold"
                  style={{ color: '#FFFFFF' }}
                >
                  {chip}
                </Typography>
              </View>
            ) : null}
          </View>
        </View>

        {children}
      </View>
    </View>
  );
}
