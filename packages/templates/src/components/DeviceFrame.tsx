import React from 'react';

type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'laptop';

interface DeviceFrameProps {
  device: DeviceType;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const deviceStyles: Record<DeviceType, React.CSSProperties> = {
  mobile: {
    width: 320,
    height: 640,
    borderRadius: 32,
    border: '8px solid #1a1a1a',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    background: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  desktop: {
    width: 600,
    height: 400,
    borderRadius: 12,
    border: '4px solid #1a1a1a',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    background: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  tablet: {
    width: 480,
    height: 640,
    borderRadius: 20,
    border: '6px solid #1a1a1a',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    background: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  laptop: {
    width: 640,
    height: 420,
    borderRadius: 12,
    border: '4px solid #1a1a1a',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)',
    background: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
};

const notches: Record<DeviceType, React.ReactNode> = {
  mobile: (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 120,
        height: 24,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        background: '#000',
        zIndex: 10,
      }}
    />
  ),
  desktop: null,
  tablet: (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 80,
        height: 16,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        background: '#000',
        zIndex: 10,
      }}
    />
  ),
  laptop: (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 100,
        height: 8,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        background: '#000',
        zIndex: 10,
      }}
    />
  ),
};

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ device, children, className, style }) => {
  return (
    <div
      className={className}
      style={{
        ...deviceStyles[device],
        ...style,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {notches[device]}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
  );
};