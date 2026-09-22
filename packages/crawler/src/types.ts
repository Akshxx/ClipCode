export interface CrawlConfig {
  url: string;
  depth: 'quick' | 'full';
  viewports: Array<'desktop' | 'mobile' | 'tablet'>;
  pages: string[];
  interactions: Array<{
    action: 'click' | 'scroll' | 'type' | 'wait';
    selector?: string;
    value?: string;
    waitFor?: string;
  }>;
  auth?: {
    type: 'none' | 'credentials' | 'cookies';
    username?: string;
    password?: string;
    cookies?: Array<{
      name: string;
      value: string;
      domain: string;
      path?: string;
      expires?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    }>;
  };
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