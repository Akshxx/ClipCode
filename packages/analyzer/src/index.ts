import { AstAnalyzer } from './ast';
import { GitAnalyzer } from './git';
import { buildBriefPrompt } from './prompts';
import { Social30sSchema, Social30sData, RepoAnalysis, LiveCrawlData, ProjectMeta } from '@clipcode/core';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AnalyzerOptions {
  repoPath: string;
  liveData?: LiveCrawlData;
  meta: ProjectMeta;
  llmProvider?: 'ollama' | 'openai' | 'anthropic';
  apiKey?: string;
  ollamaUrl?: string;
  model?: string;
}

export class RepoAnalyzer {
  private astAnalyzer: AstAnalyzer;
  private gitAnalyzer: GitAnalyzer;
  private options: AnalyzerOptions;

  constructor(options: AnalyzerOptions) {
    this.options = options;
    this.astAnalyzer = new AstAnalyzer(options.repoPath);
    this.gitAnalyzer = new GitAnalyzer(options.repoPath);
  }

  async analyze(): Promise<{
    repo: RepoAnalysis;
    brief: Social30sData;
  }> {
    const [repoAnalysis, gitStats] = await Promise.all([
      this.astAnalyzer.analyze(),
      this.gitAnalyzer.getStats(),
    ]);

    const repo: RepoAnalysis = {
      ...repoAnalysis,
      ...gitStats,
      readme: this.readFile('readme'),
      changelog: this.readFile('changelog'),
      contributing: this.readFile('contributing'),
      configs: this.readConfigs(),
    } as RepoAnalysis;

    const brief = await this.generateBrief(repo);

    return { repo, brief };
  }

  private readFile(type: 'readme' | 'changelog' | 'contributing'): string {
    const patterns: Record<string, string[]> = {
      readme: ['README.md', 'README.MD', 'Readme.md'],
      changelog: ['CHANGELOG.md', 'CHANGELOG.MD', 'HISTORY.md'],
      contributing: ['CONTRIBUTING.md', 'CONTRIBUTING.MD'],
    };

    for (const file of patterns[type]) {
      const path = join(this.options.repoPath, file);
      if (existsSync(path)) {
        return readFileSync(path, 'utf-8');
      }
    }
    return '';
  }

  private readConfigs(): { name: string; path: string; content: string }[] {
    const configs: { name: string; path: string; content: string }[] = [];
    const configFiles = [
      'tsconfig.json', 'eslint.config.js', '.eslintrc.js', '.prettierrc',
      'tailwind.config.js', 'tailwind.config.ts', 'docker-compose.yml', 'Dockerfile',
    ];

    for (const file of configFiles) {
      const path = join(this.options.repoPath, file);
      if (existsSync(path)) {
        configs.push({
          name: file,
          path: file,
          content: readFileSync(path, 'utf-8').slice(0, 2000),
        });
      }
    }
    return configs;
  }

  private async generateBrief(repo: RepoAnalysis): Promise<Social30sData> {
    const prompt = buildBriefPrompt(repo, this.options.liveData, this.options.meta);

    let response: string;

    if (this.options.llmProvider === 'openai' && this.options.apiKey) {
      response = await this.callOpenAI(prompt);
    } else if (this.options.llmProvider === 'anthropic' && this.options.apiKey) {
      response = await this.callAnthropic(prompt);
    } else {
      response = await this.callOllama(prompt);
    }

    const parsed = this.parseAndValidate(response);
    return this.fillPlaceholders(parsed, repo);
  }

  private async callOllama(prompt: string): Promise<string> {
    const url = this.options.ollamaUrl || 'http://localhost:11434';
    const model = this.options.model || 'llama3.2:3b';

    const response = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 4000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json() as { response: string };
    return data.response;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.options.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.options.apiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic error: ${response.statusText}`);
    }

    const data = await response.json() as { content: Array<{ text: string }> };
    return data.content[0].text;
  }

  private parseAndValidate(response: string): Social30sData {
    let jsonStr = response.trim();

    const codeBlockMatch = jsonStr.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) jsonStr = codeBlockMatch[1];

    const parsed = JSON.parse(jsonStr);
    const validated = Social30sSchema.parse(parsed);
    return validated;
  }

  private fillPlaceholders(brief: Social30sData, repo: RepoAnalysis): Social30sData {
    const live = this.options.liveData;

    if (live && live.screenshots.length > 0) {
      const homeScreenshot = live.screenshots.find(s => s.page === '/' && s.viewport === 'mobile')
        || live.screenshots.find(s => s.page === '/' && s.viewport === 'desktop')
        || live.screenshots[0];
      brief.reveal.screenshotUrl = homeScreenshot.url;
    }

    if (live && live.recordings.length > 0) {
      brief.demo.recordingUrl = live.recordings[0].url;
    }

    if (!brief.demo.terminalCommands || brief.demo.terminalCommands.length === 0) {
      brief.demo.terminalCommands = this.getDefaultCommands(repo.framework);
    }

    return brief;
  }

  private getDefaultCommands(framework: string): string[] {
    const commands: Record<string, string[]> = {
      nextjs: ['npm install', 'npm run dev'],
      vite: ['npm install', 'npm run dev'],
      remix: ['npm install', 'npm run dev'],
      astro: ['npm install', 'npm run dev'],
      sveltekit: ['npm install', 'npm run dev'],
      nuxt: ['npm install', 'npm run dev'],
      express: ['npm install', 'npm start'],
      fastify: ['npm install', 'npm start'],
      tauri: ['npm install', 'cargo tauri dev'],
      electron: ['npm install', 'npm run dev'],
      'react-native': ['npm install', 'npx expo start'],
    };
    return commands[framework] || ['npm install', 'npm start'];
  }
}

export async function analyzeRepo(options: AnalyzerOptions) {
  const analyzer = new RepoAnalyzer(options);
  return analyzer.analyze();
}