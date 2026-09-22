export interface CrawlConfig {
  url: string;
  depth: 'quick' | 'full';
  viewports: ('desktop' | 'mobile' | 'tablet')[];
  pages: string[];
  interactions: any[];
  auth?: { type: 'none' | 'credentials' | 'cookies' };
  lighthouse: boolean;
  captureNetwork: boolean;
  maxDuration: number;
}

export function generateCrawlPlan(repo: any, url: string): CrawlConfig {
  return {
    url,
    depth: 'quick',
    viewports: ['desktop', 'mobile'],
    pages: ['/', '/features', '/pricing', '/docs'],
    interactions: [],
    auth: { type: 'none' },
    lighthouse: true,
    captureNetwork: true,
    maxDuration: 60,
  };
}