import React from 'react';
import { Sequence, useVideoConfig, interpolate, spring } from 'remotion';
import { Hook } from './scenes/Hook';
import { Reveal } from './scenes/Reveal';
import { Features } from './scenes/Features';
import { Demo } from './scenes/Demo';
import { CTA } from './scenes/CTA';
import { Social30sData } from '../social-30s/schema';
import { WATERMARK_CONFIG } from '@clipcode/core/constants';

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

const Watermark: React.FC<{
  text: string;
  from: number;
  durationInFrames: number;
  width: number;
  height: number;
}> = ({ text, from, durationInFrames, width, height }) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const progress = interpolate(frame - from, [0, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opacity = spring(progress * 0.35, { stiffness: 100, damping: 20 });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        fontSize: 14,
        color: '#ffffff',
        opacity,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 500,
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {text}
    </div>
  );
};

import { useCurrentFrame } from 'remotion';

export { Social30sComposition };