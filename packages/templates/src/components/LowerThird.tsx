import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface LowerThirdProps {
  title: string;
  subtitle?: string;
  from?: number;
  durationInFrames?: number;
  position?: 'bottom' | 'lower-third';
  background?: string;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  title,
  subtitle,
  from = 0,
  durationInFrames = 120,
  position = 'lower-third',
  background = 'rgba(0,0,0,0.7)',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame - from, [0, durationInFrames], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const opacityProgress = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
  const opacity = spring({ frame: frame - from, fps, from: 0, to: opacityProgress, config: { stiffness: 120, damping: 20 } });
  
  const yProgress = interpolate(progress, [0, 0.15, 0.85, 1], [60, 0, 0, 60], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = spring({ frame: frame - from, fps, from: 0, to: yProgress, config: { stiffness: 100, damping: 15 } });

  const posStyles = {
    'lower-third': { bottom: 120, left: '50%' },
    bottom: { bottom: 60, left: '50%' },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...posStyles[position],
        opacity: opacity,
        transform: `translateX(-50%) translateY(${y}px)`,
        pointerEvents: 'none',
        zIndex: 100,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 4,
          padding: '12px 24px',
          background,
          backdropFilter: 'blur(8px)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 14,
              color: '#a1a1aa',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};