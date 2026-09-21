import React from 'react';
import { interpolate, spring } from 'remotion';

interface PerformanceBadgeProps {
  score: number;
  label?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'sm' | 'md' | 'lg';
  from?: number;
  durationInFrames?: number;
}

const sizes = {
  sm: { fontSize: 11, padding: '4px 8px', borderRadius: 6 },
  md: { fontSize: 13, padding: '6px 12px', borderRadius: 8 },
  lg: { fontSize: 16, padding: '8px 16px', borderRadius: 10 },
};

const positions = {
  'top-left': { top: 16, left: 16 },
  'top-right': { top: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-right': { bottom: 16, right: 16 },
};

export const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  score,
  label = 'Performance',
  position = 'top-right',
  size = 'md',
  from = 0,
  durationInFrames = 30,
}) => {
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(
    () => interpolate(frame - from, [0, durationInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    [frame, from, durationInFrames]
  );

  const opacity = spring(progress, { stiffness: 150, damping: 20 });
  const scale = spring(progress, { stiffness: 200, damping: 15 });

  const getColor = (s: number) => {
    if (s >= 90) return '#22c55e';
    if (s >= 70) return '#eab308';
    if (s >= 50) return '#f97316';
    return '#ef4444';
  };

  const color = getColor(score);
  const s = sizes[size];
  const pos = positions[position];

  return (
    <div
      style={{
        position: 'absolute',
        ...pos,
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: position.includes('left') ? 'left' : 'right',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: s.padding,
          borderRadius: s.borderRadius,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${color}40`,
          boxShadow: `0 4px 12px ${color}30`,
          fontSize: s.fontSize,
          fontWeight: 600,
          fontFamily: 'system-ui, sans-serif',
          color: '#fff',
        }}
      >
        <span style={{ color }}>{label}</span>
        <span
          style={{
            background: `linear-gradient(90deg, ${color}20, ${color}40)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {score}
        </span>
      </div>
    </div>
  );
};