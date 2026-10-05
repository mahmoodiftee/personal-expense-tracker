import {
  Car,
  CreditCard,
  GraduationCap,
  Heart,
  Home,
  ShoppingBag,
  Utensils,
  Wifi,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { IconChip, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';

import type { ChartSlice } from './chart-types';

const ICONS: LucideIcon[] = [
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Wifi,
  CreditCard,
  Heart,
  GraduationCap,
];

function iconForName(name: string): LucideIcon {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % ICONS.length;
  }
  return ICONS[hash] ?? ShoppingBag;
}

type CategoryGridProps = {
  title?: string;
  slices: ChartSlice[];
};

export function CategoryGrid({ title, slices }: CategoryGridProps) {
  const tiles = slices.slice(0, 4);

  if (tiles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="gap-4">
        {title ? <Typography variant="h2">{title}</Typography> : null}
        <View className="flex-row flex-wrap gap-3">
          {tiles.map((slice) => (
            <View
              key={slice.name}
              className="min-w-[45%] flex-1 gap-2 rounded-tile bg-raised p-3.5"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-2">
                  <Typography variant="body" className="font-semibold tabular-nums">
                    {slice.total}
                  </Typography>
                  <Typography variant="caption">{Math.round(slice.sharePct)}%</Typography>
                </View>
                <IconChip
                  icon={iconForName(slice.name)}
                  color={slice.color}
                  background={`${slice.color}22`}
                  size={36}
                />
              </View>
              <Typography variant="caption">{slice.name}</Typography>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

export { iconForName };
