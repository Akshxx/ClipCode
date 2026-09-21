import React from 'react';
import { interpolate, spring } from 'remotion';
import { DemoData } from '@clipcode/core';

interface DemoProps {
  data: DemoData;
  width: number;
  height: number;
}

export const Demo: React.FC<DemoProps> = ({ data, width, height }) => {
  const frame = React.useCurrentFrame();
  const progress = React.useMemo(() => interpolate(frame, [0, 210], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), [frame]);

  const hasRecording = data.recordingUrl && data.recordingUrl !== 'LIVE_RECORDING_PLACEHOLDER';

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
      <div
        style={{
          opacity: spring(progress < 0.2 ? progress / 0.2 : 1, { stiffness: 100, damping: 20 }),
          transform: `translateY(${spring(interpolate(progress, [0, 0.15], [30, 0], { extrapolateLeft: 'clamp' }), { stiffness: 100, damping: 15 })}px)`,
          textAlign: 'center',
          marginBottom: 32,
          maxWidth: '80%',
        }}
      >
        <p
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            marginBottom: 8,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          See it in action
        </p>
        <p
          style={{
            fontSize: 16,
            color: '#71717a',
            margin: 0,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {hasRecording ? 'Real user flow from your live app' : 'Simulated terminal demo'}
        </p>
      </div>

      {hasRecording ? (
        <VideoDemo
          url={data.recordingUrl!}
          width={width}
          height={height}
          progress={progress}
        />
      ) : (
        <TerminalDemo
          commands={data.terminalCommands || ['npx clipcode generate']}
          width={width}
          progress={progress}
        />
      )}
    </div>
  );
};

const VideoDemo: React.FC<{ url: string; width: number; height: number; progress: number }> = ({ url, width, height, progress }) => {
  const videoOpacity = spring(progress > 0.15 ? (progress - 0.15) / 0.85 : 0, { stiffness: 100, damping: 20 });

  return (
    <div
      style={{
        opacity: videoOpacity,
        transform: `scale(${spring(progress > 0.15 ? 0.95 + progress * 0.05 : 0.9, { stiffness: 100, damping: 15 })})`,
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        maxWidth: width * 0.85,
      }}
    >
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: '#000',
        }}
      />
    </div>
  );
};

const TerminalDemo: React.FC<{ commands: string[]; width: number; progress: number }> = ({ commands, width, progress }) => {
  const commandProgress = spring(Math.max(0, (progress - 0.15) / 0.85), { stiffness: 80, damping: 20 });
  const currentCommandIndex = Math.floor(commandProgress * commands.length);
  const currentCommandProgress = (commandProgress * commands.length) % 1;

  return (
    <div
      style={{
        opacity: spring(progress > 0.15 ? (progress - 0.15) / 0.85 : 0, { stiffness: 100, damping: 20 }),
        transform: `scale(${spring(progress > 0.15 ? 0.95 + progress * 0.05 : 0.9, { stiffness: 100, damping: 15 })})`,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#1e1e1e',
        border: '1px solid #333',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        maxWidth: width * 0.75,
        fontFamily: '"SF Mono", "Fira Code", monospace',
        fontSize: 16,
        lineHeight: 1.6,
      }}
    >
      <div style={{ background: '#2d2d2d', padding: '12px 16px', borderBottom: '1px solid #333', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca42' }} />
      </div>
      <div style={{ padding: 24, color: '#d4d4d4', minHeight: 200 }}>
        {commands.slice(0, currentCommandIndex).map((cmd, i) => (
          <div key={i} style={{ marginBottom: 8, opacity: 0.7 }}>
            <span style={{ color: '#888' }}>$ </span>{cmd}
          </div>
        ))}
        {currentCommandIndex < commands.length && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: '#888' }}>$ </span>
            <span style={{ color: '#d4d4d4' }}>
              {commands[currentCommandIndex].slice(0, Math.floor(commands[currentCommandIndex].length * currentCommandProgress))}
            </span>
            <span style={{ animation: 'blink 1s infinite', color: '#d4d4d4' }}>_</span>
          </div>
        )}
        <style jsx>{`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
};