import React from 'react';
import { Sequence, useVideoConfig, interpolate, spring, useCurrentFrame } from 'remotion';
import { Hook } from './scenes/Hook';
import { Reveal } from './scenes/Reveal';
import { Features } from './scenes/Features';
import { Demo } from './scenes/Demo';
import { CTA } from './scenes/CTA';
import { Social30sData } from '../social-30s/schema';

const WATERMARK_CONFIG = {
  text: 'ClipCode',
  fontSize: 14,
  opacity: 0.35,
  position: 'bottom-right' as const,
  padding: 20,
  color: '#ffffff',
};

interface CompositionProps {
  data: Social30sData;
}

const Watermark: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  width: number;
  height: number;
}> = ({ text, from, durationInFrames, width, height }) => {
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
        ...positions[WATERMARK_CONFIG.position],
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

interface CompositionProps {
  data: Social30sData;
}

export const Social30sComposition: React.FC<CompositionProps> = ({ data }) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const totalFrames = durationInFrames;

  return (
    <>
      <Sequence from={0} durationInFrames={90}>
        <Hook data={data.hook} width={width} height={height} />
      </Sequence>

      <Sequence from={90} durationInFrames={150}>
        <Reveal data={data.reveal} width={width} height={height} />
      </Sequence>

      <Sequence from={240} durationInFrames={300}>
        <Features data={data.features} width={width} height={height} />
      </Sequence>

      <Sequence from={540} durationInFrames={210}>
        <Demo data={data.demo} width={width} height={height} />
      </Sequence>

      <Sequence from={750} durationInFrames={150}>
        <CTA data={data.cta} width={width} height={height} />
      </Sequence>

      <Watermark
        text={WATERMARK_CONFIG.text}
        from={0}
        durationInFrames={totalFrames}
        width={width}
        height={height}
      />
    </>
  );
};