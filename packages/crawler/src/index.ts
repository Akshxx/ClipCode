export * from './playwright';
export * from './plan';
export * from './lighthouse';
export * from './artifacts';

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

export interface LiveCrawlData {
  screenshots: ScreenshotRef[];
  recordings: RecordingRef[];
  lighthouse: LighthouseScores;
  networkLogs: HarLog[];
  domData: DomSnapshot[];
  performance: PerformanceMetrics;
}

export interface ScreenshotRef {
  page: string;
  viewport: string;
  url: string;
  r2Key: string;
  width: number;
  height: number;
}

export interface RecordingRef {
  page: string;
  url: string;
  r2Key: string;
  duration: number;
}

export interface LighthouseScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
}

export interface HarLog {
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
}

export interface DomSnapshot {
  page: string;
  title: string;
  headings: string[];
  ctas: CtaInfo[];
  forms: FormInfo[];
  textContent: string;
}

export interface CtaInfo {
  text: string;
  href: string;
  selector: string;
}

export interface FormInfo {
  action: string;
  method: string;
  fields: string[];
}

export interface PerformanceMetrics {
  ttfb: number;
  fcp: number;
  lcp: number;
  tbt: number;
  cls: number;
}

export async function crawl(config: CrawlConfig): Promise<LiveCrawlData> {
  // Stub implementation
  return {
    screenshots: [],
    recordings: [],
    lighthouse: { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, pwa: 0 },
    networkLogs: [],
    domData: [],
    performance: { ttfb: 0, fcp: 0, lcp: 0, tbt: 0, cls: 0 },
  };
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

export async function runLighthouseOnly(url: string): Promise<any> {
  return null;
}