import React from 'react';
import { useCurrentFrame, useVideoConfig, Sequence, interpolate, spring } from 'remotion';

interface FeatureData {
  title: string;
  desc: string;
  icon?: string;
}

interface FeaturesProps {
  data: FeatureData[];
  width: number;
  height: number;
}

export const Features: React.FC<FeaturesProps> = ({ data, width, height }) => {
  const frame = useCurrentFrame();
  const featureDuration = 100;

  return (
    <div
      style={{
        width,
        height,
        background: '#0a0a0a',
        padding: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {data.map((feature, index) => (
        <Sequence key={feature.title} from={index * featureDuration} durationInFrames={featureDuration}>
          <FeatureCard
            feature={feature}
            index={index}
            width={width}
            height={height}
            featureDuration={featureDuration}
          />
        </Sequence>
      ))}
    </div>
  );
};

const FeatureCard: React.FC<{
  feature: FeatureData;
  index: number;
  width: number;
  height: number;
  featureDuration: number;
}> = ({ feature, index, width, height, featureDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = React.useMemo(
    () => interpolate(frame - index * featureDuration, [0, featureDuration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    [frame, index, featureDuration]
  );

  const cardOpacity = spring({ frame, fps, from: 0, to: progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1, config: { stiffness: 120, damping: 20 } });
  const cardY = spring({ frame, fps, from: 0, to: interpolate(progress, [0, 0.15, 0.85, 1], [40, 0, 0, -40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), config: { stiffness: 100, damping: 15 } });

  const icons: Record<string, string> = {
    spark: '⚡', rocket: '🚀', lock: '🔒', target: '🎯',
    bulb: '💡', gear: '⚙️', tool: '🔧', box: '📦',
    globe: '🌐', art: '🎨', phone: '📱',
  };

  const icon = feature.icon ? icons[feature.icon] : '✨';

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `translateY(${cardY}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        maxWidth: '70%',
      }}
    >
      <div
        style={{
          fontSize: 48,
          marginBottom: 16,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#ffffff',
          margin: 0,
          marginBottom: 12,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '-0.02em',
        }}
      >
        {feature.title}
      </h3>
      <p
        style={{
          fontSize: 20,
          color: '#a1a1aa',
          lineHeight: 1.5,
          margin: 0,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {feature.desc}
      </p>
    </div>
  );
};