import { simpleGit, SimpleGit } from 'simple-git';
import { join } from 'path';
import type { Release } from '@clipcode/core';

interface GitLogEntry {
  date: string;
  hash: string;
  message: string;
  author_name: string;
  author_email: string;
}

interface GitLogResult {
  all: GitLogEntry[];
  latest: GitLogEntry | null;
  total: number;
}

export class GitAnalyzer {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async getStats(): Promise<{
    stars: number;
    forks: number;
    contributors: number;
    recentReleases: Release[];
    commitFrequency: number;
  }> {
    const [stars, forks, contributors, recentReleases, commitFrequency] = await Promise.all([
      this.getStars(),
      this.getForks(),
      this.getContributors(),
      this.getRecentReleases(),
      this.getCommitFrequency(),
    ]);

    return { stars, forks, contributors, recentReleases, commitFrequency };
  }

  private async getStars(): Promise<number> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      if (!remoteUrl) return 0;

      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (!match) return 0;

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!response.ok) return 0;
      const data = await response.json() as { stargazers_count?: number };
      return data.stargazers_count || 0;
    } catch {
      return 0;
    }
  }

  private async getForks(): Promise<number> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      if (!remoteUrl) return 0;

      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (!match) return 0;

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!response.ok) return 0;
      const data = await response.json() as { forks_count?: number };
      return data.forks_count || 0;
    } catch {
      return 0;
    }
  }

  private async getContributors(): Promise<number> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      if (!remoteUrl) return 0;

      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (!match) return 0;

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!response.ok) return 0;
      const data = await response.json() as Array<{ login: string }>;
      return Array.isArray(data) ? data.length : 0;
    } catch {
      return 0;
    }
  }

  private async getRecentReleases(): Promise<Release[]> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      if (!remoteUrl) return [];

      const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
      if (!match) return [];

      const [, owner, repo] = match;
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (!response.ok) return [];
      const data = await response.json() as Array<{ tag_name: string; name?: string; published_at: string; html_url: string }>;

      return data.map((r) => ({
        tag: r.tag_name,
        name: r.name || r.tag_name,
        date: r.published_at,
        url: r.html_url,
      }));
    } catch {
      return [];
    }
  }

  private async getCommitFrequency(): Promise<number> {
    try {
      const log = await this.git.log({ maxCount: 100, format: '%ai' }) as unknown as { all: Array<{ date: string }> };
      if (!log.all.length) return 0;

      const dates = log.all.map((c) => new Date(c.date).getTime()).sort((a, b) => b - a);
      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const recentCommits = dates.filter((d) => d > oneWeekAgo).length;
      return recentCommits;
    } catch {
      return 0;
    }
  }

  private async getRemoteUrl(): Promise<string | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find((r) => r.name === 'origin');
      return origin?.refs?.fetch || origin?.refs?.push || null;
    } catch {
      return null;
    }
  }
}