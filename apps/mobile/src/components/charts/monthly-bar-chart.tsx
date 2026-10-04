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
};

export function MonthlyBarChart({
  title,
  points,
  emptyMessage = 'No data for this range.',
}: MonthlyBarChartProps) {
  const { resolved } = useTheme();
  const barColor = resolved === 'dark' ? '#B8E83A' : '#8BC926';
  const axisColor = resolved === 'dark' ? '#8A8A93' : '#737380';

  return (
    <Card>
      <CardContent className="gap-3">
        <Typography variant="h2">{title}</Typography>
        {points.length === 0 ? (
          <Typography variant="caption">{emptyMessage}</Typography>
        ) : (
          <View style={{ height: 180 }}>
            <CartesianChart
              data={points}
              xKey="label"
              yKeys={['value']}
              domainPadding={{ left: 24, right: 24, top: 20 }}
              axisOptions={{
                font: null,
                labelColor: axisColor,
                lineColor: axisColor,
              }}
            >
              {({ points: chartPoints, chartBounds }) => (
                <Bar
                  points={chartPoints.value}
                  chartBounds={chartBounds}
                  color={barColor}
                  roundedCorners={{
                    topLeft: 6,
                    topRight: 6,
                  }}
                />
              )}
            </CartesianChart>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
