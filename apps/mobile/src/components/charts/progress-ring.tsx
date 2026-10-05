import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Typography } from '@/components/design-system';

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  trackColor: string;
  fillColor: string;
  labelColor: string;
  caption?: string;
};

export function ProgressRing({
  value,
  size = 112,
  stroke = 9,
  trackColor,
  fillColor,
  labelColor,
  caption,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, value)) / 100;
  const center = size / 2;

  return (
    <View style={{ height: size, width: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={fillColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference * progress} ${circumference}`}
        />
      </Svg>
      <View className="absolute items-center">
        <Typography variant="h2" className="tabular-nums" style={{ color: labelColor }}>
          {Math.round(value)}%
        </Typography>
        {caption ? (
          <Typography variant="caption" className="text-[11px]" style={{ color: labelColor }}>
            {caption}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}
