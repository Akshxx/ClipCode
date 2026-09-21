import React from 'react';
import { Box, Text, Flex } from 'ink';

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
    <Flex gap={1}>
      <Text color="cyan">{frames[frame]}</Text>
      <Text>{children}</Text>
    </Flex>
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
      <Text key={i} marginTop={1} color="gray">  {item}</Text>
    ))}
  </Box>
);

export const success = (title: string, items: string[]) => {
  const lines = [`✅ ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};

export const info = (title: string, items: string[]) => {
  const lines = [`ℹ️  ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};

export const error = (title: string, items: string[]) => {
  const lines = [`❌ ${title}`, ...items.map(i => `  ${i}`)];
  return lines.join('\n');
};