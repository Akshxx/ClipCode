import React from 'remotion';
import { interpolate, spring } from 'remotion';
import { Sequence } from 'remotion';

interface HookProps {
  data: {
    problem: string;
    repoName: string;
    logoUrl?: string;
  };
  width: number;
  height: number;
}

export const Hook: React.FC<HookProps> = ({ data, width, height }) => {
  const { fps } = React.useVideoConfig();
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(() => interpolate(frame, [0, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), [frame]);

  const textOpacity = spring(progress < 0.5 ? progress * 2 : 1, { stiffness: 120, damping: 20 });
  const logoScale = spring(progress < 0.3 ? progress / 0.3 : 1, { stiffness: 150, damping: 15 });

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 80,
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
        }}
      />

      {data.logoUrl && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: `translateX(-50%) scale(${logoScale})`,
            opacity: logoScale,
            transition: 'all 0.3s ease-out',
          }}
        >
          <img
            src={data.logoUrl}
            alt={data.repoName}
            style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover' }}
          />
        </div>
      )}

      <div
        style={{
          maxWidth: '80%',
          opacity: textOpacity,
          transform: `translateY(${interpolate(progress, [0, 0.2], [30, 0], { extrapolateLeft: 'clamp' })}px)`,
        }}
      >
        <p
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.3,
            margin: 0,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          {data.problem}
        </p>
      </div>
    </div>
  );
};