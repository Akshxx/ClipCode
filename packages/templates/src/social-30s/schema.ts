import { Social30sData } from '@clipcode/core';

export { Social30sSchema } from '@clipcode/core';
export type { Social30sData } from '@clipcode/core';

export const defaultSocial30sData: Social30sData = {
  hook: {
    problem: 'Building launch videos takes hours, not minutes',
    repoName: 'ClipCode',
  },
  reveal: {
    screenshotUrl: '',
    tagline: 'Turn any repo into a 30s launch video. One command.',
  },
  features: [
    { title: 'Zero Config', desc: 'Works out of the box with smart defaults', icon: 'spark' },
    { title: 'Real Footage', desc: 'Live screenshots & recordings from your app', icon: 'camera' },
    { title: 'Free Forever', desc: 'No watermarks, no limits, no accounts', icon: 'free' },
  ],
  demo: {
    terminalCommands: ['npx clipcode generate', 'npx clipcode generate --live-url=https://myapp.com'],
  },
  cta: {
    githubUrl: 'https://github.com/clipcode/clipcode',
    stars: 0,
  },
};