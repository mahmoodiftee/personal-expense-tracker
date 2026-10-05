import { useState } from 'react';
import { Pie, PolarChart } from 'victory-native';
import { View } from 'react-native';

import { MoneyText, Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/providers/theme-provider';

import type { ChartSlice } from './chart-types';

const LABEL_W = 108;
const LABEL_H = 26;
const GAP = 8;

type DonutChartProps = {
  title?: string;
  caption?: string;
  total: string;
  slices: ChartSlice[];
  emptyMessage?: string;
};

/**
 * Angle at the middle of a slice, in radians.
 * Victory draws the pie the Skia way: 0° is 3 o'clock and positive sweep
 * goes clockwise, matching `PieLabel` (`cos(-θ)` on x, `sin(θ)` on y).
 */
function sliceMidAngle(slices: ChartSlice[], index: number) {
  const total = slices.reduce((sum, slice) => sum + Math.max(slice.sharePct, 0), 0) || 1;
  let start = 0;
  for (let i = 0; i < index; i += 1) {
    start += (Math.max(slices[i]?.sharePct ?? 0, 0) / total) * 360;
  }
  const sweep = (Math.max(slices[index]?.sharePct ?? 0, 0) / total) * 360;
  return ((start + sweep / 2) * Math.PI) / 180;
}

/** Park the label in the margin just outside the ring, growing away from the pie. */
function labelPosition(
  slices: ChartSlice[],
  index: number,
  pie: number,
  frameWidth: number,
  frameHeight: number,
) {
  const mid = sliceMidAngle(slices, index);
  const cos = Math.cos(-mid);
  const sin = Math.sin(mid);
  const centerX = frameWidth / 2;
  const centerY = frameHeight / 2;
  const edgeX = centerX + cos * (pie / 2 + GAP);
  const edgeY = centerY + sin * (pie / 2 + GAP);

  const left = cos > 0.25 ? edgeX : cos < -0.25 ? edgeX - LABEL_W : edgeX - LABEL_W / 2;
  const top = sin > 0.25 ? edgeY : sin < -0.25 ? edgeY - LABEL_H : edgeY - LABEL_H / 2;

  const alignItems = cos > 0.25 ? 'flex-start' : cos < -0.25 ? 'flex-end' : 'center';

  return {
    left: Math.max(0, Math.min(left, frameWidth - LABEL_W)),
    top: Math.max(0, Math.min(top, frameHeight - LABEL_H)),
    alignItems,
  } as const;
}

export function DonutChart({
  title,
  caption = 'Total',
  total,
  slices,
  emptyMessage = 'No data to chart yet.',
}: DonutChartProps) {
  const { palette, resolved } = useTheme();
  const labelBackground = resolved === 'dark' ? '#FFFFFF' : '#000000';
  const labelText = resolved === 'dark' ? '#000000' : '#FFFFFF';
  const [frameWidth, setFrameWidth] = useState(0);
  const width = frameWidth || 300;
  const pie = Math.max(132, width - (LABEL_W + GAP) * 2);
  const frameHeight = pie + (LABEL_H + GAP) * 2;
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
          <View
            className="w-full"
            onLayout={(event) => {
              const next = Math.round(event.nativeEvent.layout.width);
              setFrameWidth((current) => (current === next ? current : next));
            }}
            style={{ height: frameHeight }}
          >
            <View
              style={{
                position: 'absolute',
                left: (width - pie) / 2,
                top: (frameHeight - pie) / 2,
                width: pie,
                height: pie,
              }}
            >
              <PolarChart data={data} labelKey="label" valueKey="value" colorKey="color">
                <Pie.Chart innerRadius="78%">
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
                <MoneyText value={total} variant="h2" className="text-base" />
              </View>
            </View>
            {slices.map((slice, index) => {
              if (slice.sharePct < 4) return null;
              const position = labelPosition(slices, index, pie, width, frameHeight);
              return (
                <View
                  key={`${slice.name}-${index}`}
                  pointerEvents="none"
                  className="absolute"
                  style={{
                    left: position.left,
                    top: position.top,
                    width: LABEL_W,
                    height: LABEL_H,
                    alignItems: position.alignItems,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    className="flex-row items-center gap-1 rounded-full px-2 py-1"
                    style={{ backgroundColor: labelBackground }}
                  >
                    <Typography
                      variant="caption"
                      numberOfLines={1}
                      className="text-[10px] font-semibold"
                      style={{ color: labelText }}
                    >
                      {slice.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      className="text-[10px] font-semibold"
                      style={{ color: labelText }}
                    >
                      {Math.round(slice.sharePct)}%
                    </Typography>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </CardContent>
    </Card>
  );
}
