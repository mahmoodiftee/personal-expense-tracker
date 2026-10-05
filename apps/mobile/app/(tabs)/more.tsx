import { useRouter, type Href } from 'expo-router';
import {
  Landmark,
  PiggyBank,
  Receipt,
  Settings,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react-native';

import { ListRow, PageShell, Typography } from '@/components/design-system';

const LINKS = [
  {
    title: 'Income',
    description: 'Recurring sources and extra income',
    href: '/income' as Href,
    icon: TrendingUp,
  },
  {
    title: 'Expenses',
    description: 'Fixed and variable expense lists',
    href: '/expenses' as Href,
    icon: Receipt,
  },
  {
    title: 'Budgets',
    description: 'Category limits for the month',
    href: '/budgets' as Href,
    icon: Wallet,
  },
  {
    title: 'Savings goals',
    description: 'Targets and progress',
    href: '/savings-goals' as Href,
    icon: PiggyBank,
  },
  {
    title: 'Insights',
    description: 'Rule-based spending alerts',
    href: '/insights' as Href,
    icon: Sparkles,
  },
  {
    title: 'Loans',
    description: 'Bank loan payoff progress',
    href: '/loans' as Href,
    icon: Landmark,
  },
  {
    title: 'Settings',
    description: 'Theme and API connection',
    href: '/settings' as Href,
    icon: Settings,
  },
] as const;

export default function MoreTab() {
  const router = useRouter();

  return (
    <PageShell>
      <Typography variant="label">Browse</Typography>
      <Typography variant="title">More</Typography>

      <ViewLinks routerPush={(href) => router.push(href)} />
    </PageShell>
  );
}

function ViewLinks({ routerPush }: { routerPush: (href: Href) => void }) {
  return (
    <>
      {LINKS.map((link) => (
        <ListRow
          key={link.title}
          title={link.title}
          subtitle={link.description}
          icon={link.icon}
          onPress={() => routerPush(link.href)}
        />
      ))}
    </>
  );
}
