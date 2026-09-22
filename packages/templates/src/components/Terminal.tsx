import React from 'react';

interface TerminalProps {
  commands: string[];
  prompt?: string;
  theme?: 'dark' | 'light';
  width?: number | string;
  height?: number;
  typingSpeed?: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  commands,
  prompt = '$ ',
  theme = 'dark',
  width = '100%',
  height = 300,
  typingSpeed = 50,
}) => {
  const colors = {
    dark: { bg: '#1e1e1e', text: '#d4d4d4', prompt: '#6366f1', cursor: '#d4d4d4', header: '#2d2d2d' },
    light: { bg: '#ffffff', text: '#1f1f1f', prompt: '#6366f1', cursor: '#1f1f1f', header: '#f3f4f6' },
  };
  const c = colors[theme];

  const blinkStyle = {
    animation: 'blink 1s infinite',
  } as React.CSSProperties;

  return (
    <div
      style={{
        width,
        height,
        background: c.bg,
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: '"SF Mono", "Fira Code", monospace',
        fontSize: 14,
        lineHeight: 1.6,
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ background: c.header, padding: '10px 14px', borderBottom: '1px solid #333', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28ca42' }} />
      </div>
      <div style={{ padding: 20, height: `calc(100% - 42px)`, overflowY: 'auto', color: c.text }}>
        {commands.map((cmd, i) => (
          <div key={i} style={{ marginBottom: 12, whiteSpace: 'pre-wrap' }}>
            <span style={{ color: c.prompt }}>{prompt}</span>
            <span style={{ color: c.text }}>{cmd}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: c.prompt }}>{prompt}</span>
          <span style={{ color: c.text, ...blinkStyle }}>_</span>
          <style>{`
            @keyframes blink {
              0%, 50% { opacity: 1; }
              51%, 100% { opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};