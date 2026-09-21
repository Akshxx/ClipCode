import React from 'react';
import { interpolate, spring } from 'remotion';
import { FeatureData } from '@clipcode/core';

interface FeaturesProps {
  data: FeatureData[];
  width: number;
  height: number;
}

export const Features: React.FC<FeaturesProps> = ({ data, width, height }) => {
  const frame = React.useCurrentFrame();
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
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(
    () => interpolate(frame - index * featureDuration, [0, featureDuration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
    [frame, index, featureDuration]
  );

  const cardOpacity = spring(progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1, {
    stiffness: 120,
    damping: 20,
  });
  const cardY = spring(interpolate(progress, [0, 0.15, 0.85, 1], [40, 0, 0, -40], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), {
    stiffness: 100,
    damping: 15,
  });

  const icons: Record<string, string> = {
    spark: 'spark', rocket: 'rocket', lock: 'lock', target: 'target',
    bulb: 'bulb', gear: 'gear', tool: 'tool', box: 'box',
    globe: 'globe', art: 'art', phone: 'phone',
  };

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
        {icons[feature.icon] || feature.icon || 'star'}
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