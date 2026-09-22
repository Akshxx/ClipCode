import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface WatermarkProps {
  text?: string;
  from?: number;
  durationInFrames?: number;
  width?: number;
  height?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const WATERMARK_CONFIG = {
  text: 'ClipCode',
  fontSize: 14,
  opacity: 0.35,
  position: 'bottom-right' as const,
  padding: 20,
  color: '#ffffff',
};

export const Watermark: React.FC<WatermarkProps> = ({
  text = WATERMARK_CONFIG.text,
  from = 0,
  durationInFrames = 900,
  width = 1080,
  height = 1920,
  position = WATERMARK_CONFIG.position,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame - from, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = spring({ frame: frame - from, fps, from: 0, to: progress * WATERMARK_CONFIG.opacity, config: { stiffness: 100, damping: 20 } });

  const positions = {
    'bottom-right': { bottom: WATERMARK_CONFIG.padding, right: WATERMARK_CONFIG.padding },
    'bottom-left': { bottom: WATERMARK_CONFIG.padding, left: WATERMARK_CONFIG.padding },
    'top-right': { top: WATERMARK_CONFIG.padding, right: WATERMARK_CONFIG.padding },
    'top-left': { top: WATERMARK_CONFIG.padding, left: WATERMARK_CONFIG.padding },
  } as const;

  return (
    <div
      style={{
        position: 'absolute',
        ...positions[position],
        fontSize: WATERMARK_CONFIG.fontSize,
        color: WATERMARK_CONFIG.color,
        opacity: opacity,
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