import { Social30sData, RepoAnalysis, LiveCrawlData, ProjectMeta } from '@clipcode/core';

export function buildBriefPrompt(
  repo: RepoAnalysis,
  live: LiveCrawlData | undefined,
  meta: ProjectMeta
): string {
  const framework = repo.framework;
  const keyFeatures = extractKeyFeatures(repo);
  const techStack = extractTechStack(repo);
  const liveInfo = live ? formatLiveInfo(live) : 'No live crawl data available.';

  return `You are an expert at creating compelling 30-second vertical launch videos for developer tools.

Analyze this project and create a JSON brief matching the Social30sSchema exactly.

PROJECT INFO:
- Name: ${repo.name}
- Description: ${repo.description || 'No description'}
- Framework: ${framework}
- Stars: ${repo.stars}
- Version: ${repo.version}
- Tech Stack: ${techStack.join(', ')}
- Key Features: ${keyFeatures.join(', ')}
- Routes: ${repo.routes.slice(0, 10).map(r => r.path).join(', ')}
- API Endpoints: ${repo.apiEndpoints.slice(0, 10).map(e => \`\${e.method} \${e.path}\`).join(', ')}

LIVE CRAWL DATA:
${liveInfo}

README EXCERPT:
${repo.readme.slice(0, 3000)}

CREATE A JSON OBJECT with these exact fields:
{
  "hook": {
    "problem": "One sentence: what problem does this solve? Make it punchy and relatable.",
    "repoName": "${repo.name}",
    "logoUrl": ""
  },
  "reveal": {
    "screenshotUrl": "LIVE_SCREENSHOT_PLACEHOLDER",
    "tagline": "One compelling tagline under 150 chars. What does this do?"
  },
  "features": [
    {"title": "Feature 1", "desc": "Brief benefit-focused description", "icon": "spark"},
    {"title": "Feature 2", "desc": "Brief benefit-focused description", "icon": "rocket"},
    {"title": "Feature 3", "desc": "Brief benefit-focused description", "icon": "lock"}
  ],
  "demo": {
    "recordingUrl": "LIVE_RECORDING_PLACEHOLDER",
    "terminalCommands": ["npm install", "npm run dev"]
  },
  "cta": {
    "githubUrl": "https://github.com/${meta.owner}/${meta.repo}",
    "stars": ${repo.stars},
    "liveUrl": "${meta.liveUrl || ''}"
  }
}

RULES:
- Keep text SHORT - this is a 30s video
- Features must be actual features from the code, not generic
- Tagline must be specific to THIS project
- Problem must be a real pain point developers have
- Icons should be relevant text identifiers (e.g., "spark", "rocket", "lock")
- Terminal commands should be realistic for this project
- Output ONLY valid JSON, no markdown, no explanation`;
}

function extractKeyFeatures(repo: RepoAnalysis): string[] {
  const features: string[] = [];

  if (repo.framework !== 'unknown') features.push(repo.framework);
  if (repo.apiEndpoints.length > 0) features.push('REST API');
  if (repo.dbModels.length > 0) features.push('Database');
  if (repo.components.some(c => c.isPage)) features.push('UI Components');
  if (repo.dependencies.some(d => d.name.includes('auth'))) features.push('Authentication');
  if (repo.dependencies.some(d => d.name.includes('test'))) features.push('Testing');
  if (repo.dependencies.some(d => d.name.includes('docker'))) features.push('Docker');

  return features.slice(0, 8);
}

function extractTechStack(repo: RepoAnalysis): string[] {
  const stack: string[] = [repo.framework];
  const keyDeps = repo.dependencies
    .filter(d => ['react', 'vue', 'svelte', 'solid', 'typescript', 'tailwindcss', 'prisma', 'drizzle', 'trpc', 'next-auth', 'clerk'].some(k => d.name.includes(k)))
    .map(d => d.name)
    .slice(0, 10);
  return [...new Set([...stack, ...keyDeps])];
}

function formatLiveInfo(live: LiveCrawlData): string {
  const parts = [
    `Lighthouse: Perf ${live.lighthouse.performance}, A11y ${live.lighthouse.accessibility}, SEO ${live.lighthouse.seo}`,
    `Screenshots: ${live.screenshots.length} pages × ${new Set(live.screenshots.map(s => s.viewport)).size} viewports`,
    `Recordings: ${live.recordings.length} user flows`,
    `Performance: TTFB ${live.performance.ttfb}ms, LCP ${live.performance.lcp}ms`,
  ];

  if (live.domData.length > 0) {
    const headings = live.domData.flatMap(d => d.headings).slice(0, 10);
    parts.push(`Key headings: ${headings.join(', ')}`);
  }

  return parts.join('\n');
}