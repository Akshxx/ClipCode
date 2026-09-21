import React from 'react';
import { interpolate, spring } from 'remotion';
import { CtaData } from '@clipcode/core';

interface CTAProps {
  data: CtaData;
  width: number;
  height: number;
}

export const CTA: React.FC<CTAProps> = ({ data, width, height }) => {
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(() => interpolate(frame, [0, 150], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), [frame]);

  const contentOpacity = spring(progress < 0.4 ? progress / 0.4 : 1, { stiffness: 100, damping: 20 });
  const buttonScale = spring(progress > 0.6 ? Math.min(1, (progress - 0.6) / 0.4) : 0, { stiffness: 200, damping: 15 });

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

      <div
        style={{
          opacity: contentOpacity,
          transform: `translateY(${spring(interpolate(progress, [0, 0.2], [30, 0], { extrapolateLeft: 'clamp' }), { stiffness: 100, damping: 20 })}px)`,
          maxWidth: '80%',
        }}
      >
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            marginBottom: 16,
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          Ready to ship?
        </p>
        <p
          style={{
            fontSize: 20,
            color: '#a1a1aa',
            lineHeight: 1.6,
            margin: 0,
            marginBottom: 32,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {data.stars > 0 ? `Join ${data.stars.toLocaleString()}+ developers` : 'Start creating launch videos today'}
        </p>

        <a
          href={data.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 32px',
            background: '#6366f1',
            color: '#ffffff',
            borderRadius: 10,
            fontSize: 18,
            fontWeight: 600,
            fontFamily: 'system-ui, sans-serif',
            textDecoration: 'none',
            transform: `scale(${buttonScale})`,
            opacity: buttonScale,
            boxShadow: buttonScale > 0 ? '0 10px 30px rgba(99, 102, 241, 0.4)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          View on GitHub
        </a>

        {data.liveUrl && (
          <a
            href={data.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'transparent',
              color: '#a1a1aa',
              border: '1px solid #333',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 500,
              fontFamily: 'system-ui, sans-serif',
              textDecoration: 'none',
              transform: `scale(${buttonScale})`,
              opacity: buttonScale,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
};