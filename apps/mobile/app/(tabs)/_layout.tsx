import { Tabs, useRouter } from 'expo-router';
import { BarChart3, LayoutDashboard, MoreHorizontal, Plus, Wallet } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

export default function TabsLayout() {
  const router = useRouter();
  const { resolved } = useTheme();
  const active = resolved === 'dark' ? '#B8E83A' : '#8BC926';
  const inactive = resolved === 'dark' ? '#8A8A93' : '#737380';
  const background = resolved === 'dark' ? '#1F1F1F' : '#FFFFFF';
  const border = resolved === 'dark' ? '#2E2E2E' : '#E4E4E7';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: border,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="month"
        options={{
          title: 'Month',
          tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="add-tab"
        options={{
          title: 'Add',
          tabBarIcon: () => (
            <View
              style={{
                marginTop: -10,
                height: 48,
                width: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active,
              }}
            >
              <Plus color={resolved === 'dark' ? '#1A2A0A' : '#1F2E0C'} size={24} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={() => ({
          tabPress: (event) => {
            event.preventDefault();
            router.push('/add');
          },
        })}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <MoreHorizontal color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
