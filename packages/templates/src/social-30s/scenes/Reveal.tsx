import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface RevealProps {
  data: {
    screenshotUrl: string;
    tagline: string;
  };
  width: number;
  height: number;
}

export const Reveal: React.FC<RevealProps> = ({ data, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = React.useMemo(() => interpolate(frame, [0, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), [frame]);

  const screenshotScale = spring({ frame, fps, from: 0, to: progress < 0.4 ? progress / 0.4 : 1, config: { stiffness: 100, damping: 18 } });
  const taglineOpacity = spring({ frame, fps, from: 0, to: progress > 0.3 ? (progress - 0.3) / 0.7 : 0, config: { stiffness: 100, damping: 20 } });

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0a0a0a',
        padding: 60,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        }}
      />

      <div
        style={{
          transform: `scale(${screenshotScale})`,
          opacity: screenshotScale,
          filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.5))',
          borderRadius: 24,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <img
          src={data.screenshotUrl}
          alt="App screenshot"
          style={{
            width: width * 0.75,
            height: 'auto',
            maxHeight: height * 0.55,
            display: 'block',
            objectFit: 'cover',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 32,
          opacity: taglineOpacity,
          transform: `translateY(${interpolate(progress, [0.3, 0.5], [20, 0], { extrapolateLeft: 'clamp' })}px)`,
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#ffffff',
            lineHeight: 1.4,
            margin: 0,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-0.01em',
          }}
        >
          {data.tagline}
        </p>
      </div>
    </div>
  );
};