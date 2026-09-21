import * as core from '@actions/core';
import * as github from '@actions/github';
import * as glob from '@actions/glob';
import { analyzeRepo } from '@clipcode/analyzer';
import { generateCrawlPlan, crawl } from '@clipcode/crawler';
import { renderMedia, selectComposition, bundle } from '@remotion/renderer';
import { Social30sComposition } from '@clipcode/templates';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { tmpdir } from 'os';
import { generateId } from '@clipcode/core/utils/helpers';

async function run(): Promise<void> {
  try {
    const template = core.getInput('template') || 'social-30s';
    const liveUrl = core.getInput('live-url') || '';
    const crawlDepth = core.getInput('crawl-depth') || 'quick';
    const outputDir = core.getInput('output-dir') || 'clipcode-output';

    const repoPath = process.env.GITHUB_WORKSPACE || process.cwd();
    const repoUrl = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`;

    core.info(`🔍 Analyzing repository: ${repoUrl}`);
    const { repo, brief } = await analyzeRepo({
      repoPath,
      meta: {
        repoUrl,
        liveUrl: liveUrl || undefined,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        branch: github.context.ref.replace('refs/heads/', ''),
        commitSha: github.context.sha,
      },
    });

    core.info(`✅ Analyzed: ${repo.framework} framework`);

    if (liveUrl) {
      core.info(`🌐 Crawling live URL: ${liveUrl}`);
      const crawlPlan = generateCrawlPlan(repo, liveUrl);
      const liveData = await crawl(crawlPlan);
      brief.reveal.screenshotUrl = liveData.screenshots[0]?.url || brief.reveal.screenshotUrl;
      brief.demo.recordingUrl = liveData.recordings[0]?.url || brief.demo.recordingUrl;
      core.info(`✅ Crawled ${liveData.screenshots.length} screenshots`);
    }

    core.info(`🎬 Rendering video with template: ${template}`);
    const renderId = generateId('render-');
    const outputPath = join(outputDir, `${github.context.repo.repo}-30s.mp4`);
    mkdirSync(dirname(outputPath), { recursive: true });

    const bundleLocation = await bundle({
      entryPoint: join(__dirname, '../../templates/src/social-30s/Composition.tsx'),
    });

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: template,
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

    core.info(`✅ Video saved to ${outputPath}`);
    core.setOutput('video-path', outputPath);

    const artifactPattern = join(outputDir, '*.mp4');
    const globber = await glob.create(artifactPattern);
    const files = await globber.glob();
    if (files.length > 0) {
      core.info(`📦 Artifact ready: ${files[0]}`);
    }
  } catch (error) {
    core.setFailed(String(error));
  }
}

run();