export const TEMPLATES = {
  'social-30s': {
    id: 'social-30s',
    name: 'Social 30s',
    description: 'Vertical 9:16, 30 seconds - perfect for Reels/TikTok/Shorts',
    width: 1080,
    height: 1920,
    duration: 30,
    fps: 30,
    aspectRatio: '9:16',
  },
} as const;

export const DEFAULT_RENDER_CONFIG = {
  width: 1080,
  height: 1920,
  fps: 30,
  duration: 30,
  quality: '1080p' as const,
  watermark: true,
};

export const CRAWL_DEFAULTS = {
  depth: 'quick' as const,
  viewports: ['desktop', 'mobile'] as const,
  pages: ['/', '/features', '/pricing', '/docs'],
  lighthouse: true,
  captureNetwork: true,
  maxDuration: 60,
};

export const LLM_DEFAULTS = {
  model: 'llama3.2:3b',
  temperature: 0.3,
  maxTokens: 4000,
  timeout: 60000,
  ollamaUrl: 'http://localhost:11434',
};

export const RENDER_DEFAULTS = {
  codec: 'h264',
  crf: 23,
  preset: 'medium',
  pixelFormat: 'yuv420p',
};

export const WATERMARK_CONFIG = {
  text: 'ClipCode',
  fontSize: 14,
  opacity: 0.35,
  position: 'bottom-right' as const,
  padding: 20,
  color: '#ffffff',
};

export const SUPPORTED_FRAMEWORKS = [
  'nextjs',
  'vite',
  'remix',
  'astro',
  'sveltekit',
  'nuxt',
  'express',
  'fastify',
  'tauri',
  'electron',
  'react-native',
] as const;

export const FILE_PATTERNS = {
  packageJson: ['package.json'],
  readme: ['README.md', 'README.MD', 'Readme.md', 'readme.md'],
  changelog: ['CHANGELOG.md', 'CHANGELOG.MD', 'Changelog.md', 'HISTORY.md'],
  contributing: ['CONTRIBUTING.md', 'CONTRIBUTING.MD', 'Contributing.md'],
  license: ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE'],
  gitignore: ['.gitignore'],
  tsconfig: ['tsconfig.json', 'tsconfig.base.json'],
  eslint: ['.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', 'eslint.config.js'],
  prettier: ['.prettierrc', '.prettierrc.json', '.prettierrc.js', 'prettier.config.js'],
  tailwind: ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.config.cjs'],
  docker: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml'],
  github: ['.github/workflows/', '.github/actions/'],
} as const;