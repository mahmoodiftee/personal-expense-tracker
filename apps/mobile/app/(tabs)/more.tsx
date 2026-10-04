import { useRouter, type Href } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { PageShell, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/providers/theme-provider';

const LINKS: { title: string; description: string; href: Href | null }[] = [
  { title: 'Income', description: 'Recurring sources and extra income', href: '/income' as Href },
  {
    title: 'Expenses',
    description: 'Fixed and variable expense lists',
    href: '/expenses' as Href,
  },
  { title: 'Budgets', description: 'Category limits for the month', href: '/budgets' as Href },
  {
    title: 'Savings goals',
    description: 'Targets and progress',
    href: '/savings-goals' as Href,
  },
  {
    title: 'Insights',
    description: 'Rule-based spending alerts',
    href: '/insights' as Href,
  },
  { title: 'Loans', description: 'Bank loan payoff progress', href: '/loans' as Href },
  { title: 'Settings', description: 'Theme and API connection', href: '/settings' },
];

export default function MoreTab() {
  const router = useRouter();
  const { resolved } = useTheme();
  const iconColor = resolved === 'dark' ? '#8A8A93' : '#737380';

  return (
    <PageShell>
      <Typography variant="label">Browse</Typography>
      <Typography variant="h1">More</Typography>

      <View className="mt-2 gap-2">
        {LINKS.map((link) => (
          <Pressable
            key={link.title}
            disabled={!link.href}
            onPress={() => {
              if (link.href) router.push(link.href);
            }}
          >
            <Card className={!link.href ? 'opacity-60' : undefined}>
              <CardContent className="flex-row items-center gap-3 py-3.5">
                <View className="flex-1">
                  <Typography variant="body" className="font-semibold">
                    {link.title}
                  </Typography>
                  <Typography variant="caption">{link.description}</Typography>
                </View>
                {link.href ? <ChevronRight size={18} color={iconColor} /> : null}
              </CardContent>
            </Card>
          </Pressable>
        ))}
      </View>
    </PageShell>
  );
}
