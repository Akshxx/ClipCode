import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface MetricCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  from?: number;
  durationInFrames?: number;
}

export const MetricCounter: React.FC<MetricCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1,
  fontSize = 48,
  fontWeight = 700,
  color = '#ffffff',
  from = 0,
  durationInFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame - from, [0, durationInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const easedProgress = spring({ frame: frame - from, fps, from: 0, to: progress, config: { stiffness: 80, damping: 15 } });
  const currentValue = easedProgress * value;

  const formatted = currentValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily: 'system-ui, sans-serif',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
      }}
    >
      {prefix}{formatted}{suffix}
    </div>
  );
};