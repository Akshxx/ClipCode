import { CrawlConfig, RepoAnalysis } from '@clipcode/core';

export function generateCrawlPlan(repo: RepoAnalysis, url: string): CrawlConfig {
  const framework = repo.framework;
  const routes = repo.routes.map(r => r.path);
  const pages = inferKeyPages(framework, routes);
  const interactions = inferInteractions(framework, pages);

  return {
    url,
    depth: 'quick' as const,
    viewports: ['desktop', 'mobile'] as const,
    pages,
    interactions,
    auth: { type: 'none' as const },
    lighthouse: true,
    captureNetwork: true,
    maxDuration: 60,
  };
}

function inferKeyPages(framework: string, routes: string[]): string[] {
  const priorityPaths = ['/', '/features', '/pricing', '/docs', '/about', '/blog', '/changelog'];
  const found = priorityPaths.filter(p => routes.some(r => r === p || r.startsWith(p + '/')));

  if (found.length === 0) {
    return routes.slice(0, 4);
  }

  return found.slice(0, 4);
}

function inferInteractions(framework: string, pages: string[]) {
  const interactions: any[] = [];

  if (pages.includes('/') || pages.includes('/features')) {
    interactions.push({
      action: 'scroll',
      waitFor: 'body',
    });
  }

  if (pages.some(p => p.includes('pricing') || p.includes('signup'))) {
    interactions.push({
      action: 'click',
      selector: 'a[href*="pricing"], a[href*="signup"], a[href*="sign-up"], button:has-text("Get Started"), button:has-text("Sign Up")',
    });
  }

  return interactions;
}