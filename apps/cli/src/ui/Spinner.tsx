import React from 'react';
import { Box, Text } from 'ink';

interface SpinnerProps {
  children: React.ReactNode;
}

export const Spinner: React.FC<SpinnerProps> = ({ children }) => {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <Box flexDirection="row" gap={1}>
      <Text color="cyan">{frames[frame]}</Text>
      <Text>{children}</Text>
    </Box>
  );
};

interface PanelProps {
  title: string;
  items: string[];
}

export const Panel: React.FC<PanelProps> = ({ title, items }) => (
  <Box flexDirection="column" marginTop={1} marginBottom={1} borderStyle="round" borderColor="gray" paddingX={2} paddingY={1}>
    <Text bold color="white">{title}</Text>
    {items.map((item, i) => (
      <Box key={i} marginTop={1}>
        <Text color="gray">  {item}</Text>
      </Box>
    ))}
  </Box>
);

export const success = (title: string, items: string[]) => {
  const lines = [`[OK] ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};

export const info = (title: string, items: string[]) => {
  const lines = [`[Info] ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};

export const error = (title: string, items: string[]) => {
  const lines = [`[Error] ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};