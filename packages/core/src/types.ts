export interface RepoAnalysis {
  name: string;
  description: string;
  version: string;
  license: string;
  framework: FrameworkType;
  entryPoints: string[];
  routes: RouteInfo[];
  components: ComponentInfo[];
  apiEndpoints: ApiEndpoint[];
  dbModels: DbModel[];
  dependencies: DepInfo[];
  devDependencies: DepInfo[];
  stars: number;
  forks: number;
  contributors: number;
  recentReleases: Release[];
  commitFrequency: number;
  readme: string;
  changelog: string;
  contributing: string;
  configs: ConfigFile[];
}

export type FrameworkType =
  | 'nextjs'
  | 'vite'
  | 'remix'
  | 'astro'
  | 'sveltekit'
  | 'nuxt'
  | 'express'
  | 'fastify'
  | 'tauri'
  | 'electron'
  | 'react-native'
  | 'unknown';

export interface RouteInfo {
  path: string;
  file: string;
  method?: string;
  isDynamic: boolean;
}

export interface ComponentInfo {
  name: string;
  file: string;
  props: string[];
  isPage: boolean;
}

export interface ApiEndpoint {
  path: string;
  method: string;
  file: string;
  params: string[];
}

export interface DbModel {
  name: string;
  file: string;
  fields: ModelField[];
}

export interface ModelField {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
}

export interface DepInfo {
  name: string;
  version: string;
  isDev: boolean;
}

export interface Release {
  tag: string;
  name: string;
  date: string;
  url: string;
}

export interface ConfigFile {
  name: string;
  path: string;
  content: string;
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

export interface ProjectMeta {
  repoUrl?: string;
  liveUrl?: string;
  owner: string;
  repo: string;
  branch: string;
  commitSha: string;
}

export interface VideoJob {
  id: string;
  projectId: string;
  template: TemplateId;
  config: RenderConfig;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  outputUrl?: string;
  hostedUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type TemplateId = 'social-30s';

export interface RenderConfig {
  width: number;
  height: number;
  fps: number;
  duration: number;
  quality: '720p' | '1080p' | '4k';
  watermark: boolean;
}

export interface Social30sData {
  hook: HookData;
  reveal: RevealData;
  features: FeatureData[];
  demo: DemoData;
  cta: CtaData;
}

export interface HookData {
  problem: string;
  repoName: string;
  logoUrl?: string;
}

export interface RevealData {
  screenshotUrl: string;
  tagline: string;
}

export interface FeatureData {
  title: string;
  desc: string;
  icon?: string;
}

export interface DemoData {
  recordingUrl?: string;
  terminalCommands?: string[];
}

export interface CtaData {
  githubUrl: string;
  stars: number;
  liveUrl?: string;
}

export interface AnalysisResult {
  repo: RepoAnalysis;
  live?: LiveCrawlData;
  meta: ProjectMeta;
  brief: Social30sData;
}