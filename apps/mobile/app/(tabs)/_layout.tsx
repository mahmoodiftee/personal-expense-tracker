import { Tabs, useRouter } from 'expo-router';
import { BarChart3, LayoutDashboard, MoreHorizontal, Plus, Wallet } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_BOTTOM_GAP, TAB_BAR_HEIGHT, TAB_BAR_HORIZONTAL_INSET } from '@/lib/layout';
import { useTheme } from '@/providers/theme-provider';

const ICONS = {
  index: LayoutDashboard,
  month: Wallet,
  'add-tab': Plus,
  analytics: BarChart3,
  more: MoreHorizontal,
} as const;

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

type FloatingTabBarProps = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
};

function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { palette } = useTheme();

  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0"
      style={{ bottom: insets.bottom + TAB_BAR_BOTTOM_GAP }}
    >
      <View
        className="flex-row items-center justify-between px-2"
        style={{
          height: TAB_BAR_HEIGHT,
          marginHorizontal: TAB_BAR_HORIZONTAL_INSET,
          borderRadius: TAB_BAR_HEIGHT / 2,
          backgroundColor: palette.surfaceRaised,
          borderWidth: 1,
          borderColor: palette.border,
        }}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key] ?? { options: {} };
          const Icon = ICONS[route.name as keyof typeof ICONS] ?? LayoutDashboard;
          const label = options.title ?? route.name;
          const isAdd = route.name === 'add-tab';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                if (isAdd) {
                  router.push('/add');
                  return;
                }
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              className="items-center justify-center rounded-full"
              style={
                isAdd
                  ? {
                      height: 52,
                      width: 52,
                      marginTop: -10,
                      backgroundColor: palette.primary,
                    }
                  : {
                      height: 44,
                      width: 44,
                      backgroundColor: focused ? palette.card : 'transparent',
                    }
              }
            >
              <Icon
                size={isAdd ? 24 : 22}
                color={
                  isAdd
                    ? palette.primaryForeground
                    : focused
                      ? palette.foreground
                      : palette.mutedForeground
                }
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="month" options={{ title: 'Month' }} />
      <Tabs.Screen name="add-tab" options={{ title: 'Add' }} />
      <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}
