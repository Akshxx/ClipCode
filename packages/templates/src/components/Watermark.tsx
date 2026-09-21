import React from 'react';
import { interpolate, spring } from 'remotion';
import { WATERMARK_CONFIG } from '@clipcode/core/constants';

interface WatermarkProps {
  text?: string;
  from?: number;
  durationInFrames?: number;
  width?: number;
  height?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const Watermark: React.FC<WatermarkProps> = ({
  text = WATERMARK_CONFIG.text,
  from = 0,
  durationInFrames = 900,
  width = 1080,
  height = 1920,
  position = WATERMARK_CONFIG.position,
}) => {
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(
    () => interpolate(frame - from, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    [frame, from]
  );

  const opacity = spring(progress * WATERMARK_CONFIG.opacity, { stiffness: 100, damping: 20 });

  const positions = {
    'bottom-right': { bottom: WATERMARK_CONFIG.padding, right: WATERMARK_CONFIG.padding },
    'bottom-left': { bottom: WATERMARK_CONFIG.padding, left: WATERMARK_CONFIG.padding },
    'top-right': { top: WATERMARK_CONFIG.padding, right: WATERMARK_CONFIG.padding },
    'top-left': { top: WATERMARK_CONFIG.padding, left: WATERMARK_CONFIG.padding },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positions[position],
        fontSize: WATERMARK_CONFIG.fontSize,
        color: WATERMARK_CONFIG.color,
        opacity,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 500,
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        zIndex: 1000,
        userSelect: 'none',
      }}
    >
      {text}
    </div>
  );
};