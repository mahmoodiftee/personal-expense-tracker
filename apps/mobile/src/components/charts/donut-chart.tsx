import { Pie, PolarChart } from 'victory-native';
import { View } from 'react-native';

import { MoneyText, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/providers/theme-provider';

import type { ChartSlice } from './chart-types';

const SIZE = 240;
const BUBBLE = 36;

type DonutChartProps = {
  title?: string;
  caption?: string;
  total: string;
  slices: ChartSlice[];
  emptyMessage?: string;
};

function bubblePosition(slices: ChartSlice[], index: number) {
  const total = slices.reduce((sum, slice) => sum + Math.max(slice.sharePct, 0), 0) || 1;
  let start = -90;
  for (let i = 0; i < index; i += 1) {
    start += (Math.max(slices[i]?.sharePct ?? 0, 0) / total) * 360;
  }
  const sweep = (Math.max(slices[index]?.sharePct ?? 0, 0) / total) * 360;
  const mid = ((start + sweep / 2) * Math.PI) / 180;
  const radius = SIZE / 2 - 8;
  return {
    left: SIZE / 2 + Math.cos(mid) * radius - BUBBLE / 2,
    top: SIZE / 2 + Math.sin(mid) * radius - BUBBLE / 2,
  };
}

export function DonutChart({
  title,
  caption = 'Total',
  total,
  slices,
  emptyMessage = 'No data to chart yet.',
}: DonutChartProps) {
  const { palette } = useTheme();
  const data = slices
    .filter((slice) => slice.sharePct > 0)
    .map((slice) => ({
      label: slice.name,
      value: Math.max(slice.sharePct, 0.01),
      color: slice.color,
    }));

  return (
    <Card>
      <CardContent className="items-center gap-4">
        {title ? (
          <View className="w-full">
            <Typography variant="h2">{title}</Typography>
          </View>
        ) : null}
        {data.length === 0 ? (
          <Typography variant="caption">{emptyMessage}</Typography>
        ) : (
          <View style={{ height: SIZE, width: SIZE }}>
            <PolarChart data={data} labelKey="label" valueKey="value" colorKey="color">
              <Pie.Chart innerRadius="72%">
                {() => (
                  <>
                    <Pie.Slice />
                    <Pie.SliceAngularInset
                      angularInset={{
                        angularStrokeWidth: 6,
                        angularStrokeColor: palette.card,
                      }}
                    />
                  </>
                )}
              </Pie.Chart>
            </PolarChart>
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
              <Typography variant="caption">{caption}</Typography>
              <MoneyText value={total} variant="h2" />
            </View>
            {slices.map((slice, index) => {
              if (slice.sharePct < 4) return null;
              const position = bubblePosition(slices, index);
              return (
                <View
                  key={`${slice.name}-${index}`}
                  pointerEvents="none"
                  className="absolute items-center justify-center rounded-full bg-foreground"
                  style={{
                    height: BUBBLE,
                    width: BUBBLE,
                    left: position.left,
                    top: position.top,
                  }}
                >
                  <Typography
                    variant="caption"
                    className="text-[10px] font-semibold text-background"
                  >
                    {Math.round(slice.sharePct)}%
                  </Typography>
                </View>
              );
            })}
          </View>
        )}
      </CardContent>
    </Card>
  );
}
