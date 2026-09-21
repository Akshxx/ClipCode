import { Command } from 'commander';
import { Spinner } from '../ui/Spinner';
import { Panel } from '../ui/Panel';
import { analyzeRepo } from '@clipcode/analyzer';
import { generateCrawlPlan, crawl } from '@clipcode/crawler';
import { renderMedia, selectComposition, bundle } from '@remotion/renderer';
import { Social30sComposition } from '@clipcode/templates';
import { PrismaClient } from '@clipcode/db';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { tmpdir } from 'os';
import { generateId } from '@clipcode/core/utils/helpers';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';

export const generateCommand = new Command('generate')
  .description('Generate a 30s launch video from the current repository')
  .option('-t, --template <template>', 'Template to use', 'social-30s')
  .option('-u, --live-url <url>', 'Live deployed URL for crawl')
  .option('-d, --crawl-depth <depth>', 'Crawl depth: quick | full', 'quick')
  .option('-o, --output <path>', 'Output file path')
  .option('--json', 'Output JSON result')
  .option('--no-crawl', 'Skip live crawl')
  .option('--api-key <key>', 'LLM API key (OpenAI/Anthropic)')
  .option('--provider <provider>', 'LLM provider: ollama | openai | anthropic', 'ollama')
  .action(async (options) => {
    const spinner = new Spinner();
    const repoPath = resolve(process.cwd());

    try {
      const prisma = new PrismaClient();

      const project = await prisma.project.upsert({
        where: { repoUrl: getRepoUrl(repoPath) || '' },
        update: {},
        create: {
          name: getRepoName(repoPath),
          repoUrl: getRepoUrl(repoPath),
          liveUrl: options.liveUrl,
          ownerId: 'local',
        },
      });

      spinner.start('Analyzing repository...');
      const { repo, brief } = await analyzeRepo({
        repoPath,
        meta: {
          repoUrl: getRepoUrl(repoPath) || '',
          liveUrl: options.liveUrl,
          owner: getRepoOwner(repoPath) || 'unknown',
          repo: getRepoName(repoPath),
          branch: 'main',
          commitSha: '',
        },
        llmProvider: options.provider as any,
        apiKey: options.apiKey,
      });
      spinner.succeed(`Analyzed: ${repo.framework} + ${repo.dependencies.length} deps`);

      let liveData;
      if (options.liveUrl && !options.noCrawl) {
        spinner.start('Crawling live URL...');
        const crawlPlan = generateCrawlPlan(repo, options.liveUrl);
        liveData = await crawl(crawlPlan);
        brief.reveal.screenshotUrl = liveData.screenshots[0]?.url || brief.reveal.screenshotUrl;
        brief.demo.recordingUrl = liveData.recordings[0]?.url || brief.demo.recordingUrl;
        spinner.succeed(`Crawled ${liveData.screenshots.length} screenshots, ${liveData.recordings.length} recordings`);
      }

      spinner.start('Rendering video...');
      const renderId = generateId('render-');
      const outputPath = options.output || join(process.cwd(), 'clipcode-output', `${project.name}-30s.mp4`);
      mkdirSync(dirname(outputPath), { recursive: true });

      const bundleLocation = await bundle({
        entryPoint: join(__dirname, '../../templates/src/social-30s/Composition.tsx'),
      });

      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'social-30s',
        inputProps: brief,
      });

      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        outputLocation: outputPath,
        inputProps: brief,
        codec: 'h264',
        crf: 23,
        preset: 'medium',
        width: 1080,
        height: 1920,
        frameRate: 30,
      });

      spinner.succeed(`Video saved to ${chalk.cyan(outputPath)}`);

      const render = await prisma.render.create({
        data: {
          projectId: project.id,
          template: 'social-30s',
          config: { width: 1080, height: 1920, fps: 30, duration: 30 },
          status: 'COMPLETED',
          videoUrl: `file://${outputPath}`,
          completedAt: new Date(),
        },
      });

      if (options.json) {
        console.log(JSON.stringify({ renderId: render.id, outputPath, brief }, null, 2));
      } else {
        console.log(Panel.success('Done!', [
          `Video: ${chalk.cyan(outputPath)}`,
          `Duration: 30s | 1080x1920 | 30fps`,
          `Template: social-30s`,
        ]));
      }
    } catch (error) {
      spinner.fail(String(error));
      process.exit(1);
    }
  });

function getRepoUrl(path: string): string | null {
  try {
    const git = require('simple-git')(path);
    const remotes = git.getRemotes(true);
    const origin = remotes.find((r: any) => r.name === 'origin');
    return origin?.refs?.fetch || origin?.refs?.push || null;
  } catch {
    return null;
  }
}

function getRepoName(path: string): string {
  return path.split('/').pop() || 'clipcode-project';
}

function getRepoOwner(path: string): string | null {
  try {
    const url = getRepoUrl(path);
    if (!url) return null;
    const match = url.match(/github\.com[:/]([^/]+)\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}