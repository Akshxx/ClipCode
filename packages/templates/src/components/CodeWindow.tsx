import React from 'react';

interface CodeWindowProps {
  code: string;
  language?: string;
  theme?: 'dark' | 'light';
  showLineNumbers?: boolean;
  highlightLines?: number[];
  maxHeight?: number;
  width?: number | string;
}

const themes = {
  dark: {
    background: '#1e1e1e',
    text: '#d4d4d4',
    keyword: '#c586c0',
    string: '#ce9178',
    comment: '#6a9955',
    function: '#dcdcaa',
    number: '#b5cea8',
    operator: '#d4d4d4',
    punctuation: '#d4d4d4',
    lineNumber: '#858585',
    highlight: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    background: '#ffffff',
    text: '#1f1f1f',
    keyword: '#af00db',
    string: '#a31515',
    comment: '#008000',
    function: '#795e26',
    number: '#098658',
    operator: '#1f1f1f',
    punctuation: '#1f1f1f',
    lineNumber: '#999999',
    highlight: 'rgba(0, 0, 0, 0.05)',
  },
};

const tokenPatterns = [
  { pattern: /\b(const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|async|await|try|catch|finally|new|this|super|extends|implements|public|private|protected|static|readonly|abstract|declare|namespace|module|enum|any|void|never|unknown|string|number|boolean|object|symbol|bigint|null|undefined)\b/g, type: 'keyword' },
  { pattern: /("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/g, type: 'string' },
  { pattern: /\/\/.*$/gm, type: 'comment' },
  { pattern: /\/\*[\s\S]*?\*\//g, type: 'comment' },
  { pattern: /\b(\d+\.?\d*)\b/g, type: 'number' },
  { pattern: /\b([A-Z][a-zA-Z0-9]*)\s*(?=\()/g, type: 'function' },
];

export const CodeWindow: React.FC<CodeWindowProps> = ({
  code,
  language = 'typescript',
  theme = 'dark',
  showLineNumbers = true,
  highlightLines = [],
  maxHeight = 400,
  width = '100%',
}) => {
  const t = themes[theme];
  const lines = code.split('\n');

  const highlightLine = (line: string, lineNumber: number) => {
    let highlighted = line;
    let lastIndex = 0;
    const matches: { index: number; length: number; type: string }[] = [];

    for (const { pattern, type } of tokenPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        matches.push({ index: match.index, length: match[0].length, type });
      }
    }

    matches.sort((a, b) => a.index - b.index);

    let result = '';
    for (const match of matches) {
      if (match.index > lastIndex) {
        result += line.slice(lastIndex, match.index);
      }
      result += `<span style="color: ${t[match.type as keyof typeof t]}">${line.slice(match.index, match.index + match.length)}</span>`;
      lastIndex = match.index + match.length;
    }
    if (lastIndex < line.length) {
      result += line.slice(lastIndex);
    }
    return result || line;
  };

  return (
    <div
      style={{
        width,
        maxHeight,
        background: t.background,
        borderRadius: 8,
        overflow: 'hidden',
        fontFamily: '"SF Mono", "Fira Code", "Monaco", monospace',
        fontSize: 13,
        lineHeight: 1.6,
        border: '1px solid #333',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex' }}>
        {showLineNumbers && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(0,0,0,0.2)',
              borderRight: '1px solid #333',
              textAlign: 'right',
              userSelect: 'none',
              minWidth: 50,
            }}
          >
            {lines.map((_, i) => (
              <div
                key={i}
                style={{
                  color: highlightLines.includes(i + 1) ? t.text : t.lineNumber,
                  fontWeight: highlightLines.includes(i + 1) ? 600 : 400,
                  height: '1.6em',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <div style={{ flex: 1, padding: '12px 16px', overflowX: 'auto', whiteSpace: 'pre' }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                height: '1.6em',
                background: highlightLines.includes(i + 1) ? t.highlight : 'transparent',
              }}
              dangerouslySetInnerHTML={{ __html: highlightLine(line, i + 1) || '&nbsp;' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};