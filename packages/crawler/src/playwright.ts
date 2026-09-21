import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { CrawlConfig, LiveCrawlData, ScreenshotRef, RecordingRef, LighthouseScores, HarLog, DomSnapshot, PerformanceMetrics } from '@clipcode/core';
import { generateId } from '@clipcode/core/utils/helpers';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';

export class PlaywrightCrawler {
  private browser: Browser | null = null;
  private config: CrawlConfig;

  constructor(config: CrawlConfig) {
    this.config = config;
  }

  async crawl(): Promise<LiveCrawlData> {
    this.browser = await chromium.launch({ headless: true });

    try {
      const context = await this.createContext();
      const results: LiveCrawlData = {
        screenshots: [],
        recordings: [],
        lighthouse: this.getEmptyLighthouse(),
        networkLogs: [],
        domData: [],
        performance: this.getEmptyPerformance(),
      };

      for (const pagePath of this.config.pages) {
        const pageUrl = new URL(pagePath, this.config.url).toString();
        const pageResults = await this.crawlPage(context, pageUrl, pagePath);
        results.screenshots.push(...pageResults.screenshots);
        results.recordings.push(...pageResults.recordings);
        results.networkLogs.push(...pageResults.networkLogs);
        results.domData.push(...pageResults.domData);
      }

      if (this.config.lighthouse) {
        results.lighthouse = await this.runLighthouse(this.config.url);
        results.performance = await this.extractPerformance(this.config.url);
      }

      return results;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async createContext(): Promise<BrowserContext> {
    const context = await this.browser!.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (compatible; ClipCode/1.0; +https://clipcode.dev)',
      recordVideo: {
        dir: join(tmpdir(), 'clipcode-recordings'),
        size: { width: 1280, height: 720 },
      },
    });

    if (this.config.auth.type === 'cookies' && this.config.auth.cookies) {
      await context.addCookies(this.config.auth.cookies);
    }

    return context;
  }

  private async crawlPage(
    context: BrowserContext,
    url: string,
    pagePath: string
  ): Promise<{
    screenshots: ScreenshotRef[];
    recordings: RecordingRef[];
    networkLogs: HarLog[];
    domData: DomSnapshot[];
  }> {
    const page = await context.newPage();
    const networkLogs: HarLog[] = [];
    const screenshots: ScreenshotRef[] = [];
    const recordings: RecordingRef[] = [];
    const domData: DomSnapshot[] = [];

    if (this.config.captureNetwork) {
      page.on('response', (response) => {
        networkLogs.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          duration: response.timing().responseEnd - response.timing().requestStart,
          size: response.headers()['content-length'] ? parseInt(response.headers()['content-length']!) : 0,
        });
      });
    }

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForLoadState('domcontentloaded');

      for (const viewportName of this.config.viewports) {
        const viewport = this.getViewport(viewportName);
        await page.setViewportSize(viewport);

        await page.waitForTimeout(500);

        const screenshot = await page.screenshot({
          fullPage: true,
          type: 'webp',
          quality: 80,
        });

        const screenshotId = generateId('screenshot-');
        const screenshotPath = join(tmpdir(), 'clipcode-screenshots', `${screenshotId}.webp`);
        mkdirSync(dirname(screenshotPath), { recursive: true });
        writeFileSync(screenshotPath, screenshot);

        screenshots.push({
          page: pagePath,
          viewport: viewportName,
          url: `file://${screenshotPath}`,
          r2Key: `screenshots/${screenshotId}.webp`,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const dom = await this.extractDom(page, pagePath);
      domData.push(dom);

      if (this.config.interactions.length > 0) {
        for (const interaction of this.config.interactions) {
          await this.executeInteraction(page, interaction);
        }

        const videoPath = await page.video()?.path();
        if (videoPath) {
          const recordingId = generateId('recording-');
          const finalPath = join(tmpdir(), 'clipcode-recordings', `${recordingId}.webm`);
          mkdirSync(dirname(finalPath), { recursive: true });
          require('fs').renameSync(videoPath, finalPath);

          recordings.push({
            page: pagePath,
            url: `file://${finalPath}`,
            r2Key: `recordings/${recordingId}.webm`,
            duration: 0,
          });
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    } finally {
      await page.close();
    }

    return { screenshots, recordings, networkLogs, domData };
  }

  private async executeInteraction(page: Page, interaction: any): Promise<void> {
    switch (interaction.action) {
      case 'click':
        if (interaction.selector) {
          await page.click(interaction.selector, { timeout: 10000 });
        }
        break;
      case 'scroll':
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        break;
      case 'type':
        if (interaction.selector && interaction.value) {
          await page.fill(interaction.selector, interaction.value);
        }
        break;
      case 'wait':
        if (interaction.waitFor) {
          await page.waitForSelector(interaction.waitFor, { timeout: 10000 });
        } else {
          await page.waitForTimeout(1000);
        }
        break;
    }

    if (interaction.waitFor) {
      await page.waitForSelector(interaction.waitFor, { timeout: 10000 });
    }
  }

  private async extractDom(page: Page, pagePath: string): Promise<DomSnapshot> {
    return page.evaluate((path) => {
      const title = document.title;
      const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(Boolean) as string[];

      const ctas = Array.from(document.querySelectorAll('a[href], button'))
        .slice(0, 20)
        .map(el => ({
          text: el.textContent?.trim() || '',
          href: el.tagName === 'A' ? (el as HTMLAnchorElement).href : '',
          selector: el.tagName.toLowerCase(),
        }))
        .filter(c => c.text);

      const forms = Array.from(document.querySelectorAll('form'))
        .map(form => ({
          action: (form as HTMLFormElement).action,
          method: (form as HTMLFormElement).method,
          fields: Array.from(form.querySelectorAll('input, select, textarea'))
            .map(f => (f as HTMLInputElement).name || (f as HTMLInputElement).type)
            .filter(Boolean),
        }));

      return {
        page: path,
        title,
        headings,
        ctas,
        forms,
        textContent: document.body.innerText.slice(0, 5000),
      };
    }, pagePath);
  }

  private async runLighthouse(url: string): Promise<LighthouseScores> {
    const lighthouse = (await import('lighthouse')).default;
    const chromeLauncher = (await import('chrome-launcher')).default;

    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    });

    try {
      const runnerResult = await lighthouse(url, {
        port: chrome.port,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        output: 'json',
        logLevel: 'error',
      });

      const lhr = runnerResult.lhr;
      return {
        performance: Math.round(lhr.categories.performance?.score * 100) || 0,
        accessibility: Math.round(lhr.categories.accessibility?.score * 100) || 0,
        bestPractices: Math.round(lhr.categories['best-practices']?.score * 100) || 0,
        seo: Math.round(lhr.categories.seo?.score * 100) || 0,
        pwa: Math.round(lhr.categories.pwa?.score * 100) || 0,
      };
    } catch (error) {
      console.error('Lighthouse error:', error);
      return this.getEmptyLighthouse();
    } finally {
      await chrome.kill();
    }
  }

  private async extractPerformance(url: string): Promise<PerformanceMetrics> {
    const page = await this.browser!.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

        return {
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          lcp: lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : 0,
          tbt: 0,
          cls: 0,
        };
      });

      return metrics;
    } catch {
      return this.getEmptyPerformance();
    } finally {
      await page.close();
    }
  }

  private getViewport(name: string): { width: number; height: number } {
    const viewports: Record<string, { width: number; height: number }> = {
      desktop: { width: 1280, height: 720 },
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
    };
    return viewports[name] || viewports.desktop;
  }

  private getEmptyLighthouse(): LighthouseScores {
    return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, pwa: 0 };
  }

  private getEmptyPerformance(): PerformanceMetrics {
    return { ttfb: 0, fcp: 0, lcp: 0, tbt: 0, cls: 0 };
  }
}