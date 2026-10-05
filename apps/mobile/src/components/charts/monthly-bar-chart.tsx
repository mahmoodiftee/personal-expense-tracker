import { View } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';

import { Typography } from '@/components/design-system';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/providers/theme-provider';

export type MonthlyBarPoint = {
  label: string;
  value: number;
};

type MonthlyBarChartProps = {
  title: string;
  points: MonthlyBarPoint[];
  emptyMessage?: string;
  highlightLast?: boolean;
};

export function MonthlyBarChart({
  title,
  points,
  emptyMessage = 'No data for this range.',
  highlightLast = true,
}: MonthlyBarChartProps) {
  const { palette } = useTheme();

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{title}</Typography>
        {points.length === 0 ? (
          <Typography variant="caption">{emptyMessage}</Typography>
        ) : (
          <View className="gap-2">
            <View style={{ height: 180 }}>
              <CartesianChart
                data={points}
                xKey="label"
                yKeys={['value']}
                domainPadding={{ left: 18, right: 18, top: 16 }}
                axisOptions={{
                  font: null,
                  labelColor: 'transparent',
                  lineColor: 'transparent',
                }}
              >
                {({ points: chartPoints, chartBounds }) => {
                  const last = chartPoints.value.length - 1;
                  const corners = {
                    topLeft: 10,
                    topRight: 10,
                    bottomLeft: 10,
                    bottomRight: 10,
                  };
                  const inactive = highlightLast
                    ? chartPoints.value.filter((_, index) => index !== last)
                    : chartPoints.value;
                  const active = highlightLast
                    ? chartPoints.value.filter((_, index) => index === last)
                    : [];
                  return (
                    <>
                      <Bar
                        points={inactive}
                        chartBounds={chartBounds}
                        innerPadding={0.45}
                        barCount={points.length}
                        roundedCorners={corners}
                        color={palette.chartTrack}
                      />
                      {active.length > 0 ? (
                        <Bar
                          points={active}
                          chartBounds={chartBounds}
                          innerPadding={0.45}
                          barCount={points.length}
                          roundedCorners={corners}
                          color={palette.primary}
                        />
                      ) : null}
                    </>
                  );
                }}
              </CartesianChart>
            </View>
            <View className="flex-row justify-between px-1">
              {points.map((point, index) => {
                const active = highlightLast && index === points.length - 1;
                return (
                  <Typography
                    key={`${point.label}-${index}`}
                    variant="caption"
                    className={active ? 'font-semibold text-foreground' : 'text-foreground'}
                  >
                    {point.label}
                  </Typography>
                );
              })}
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
