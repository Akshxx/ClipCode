import { Project, SourceFile, SyntaxKind, Node } from 'ts-morph';
import { join, relative, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import type {
  RepoAnalysis,
  RouteInfo,
  ComponentInfo,
  ApiEndpoint,
  DbModel,
  ModelField,
  FrameworkType,
} from '@clipcode/core';

export class AstAnalyzer {
  private project: Project;
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.project = new Project({
      tsConfigFilePath: join(rootPath, 'tsconfig.json'),
      skipAddingFilesFromTsConfig: true,
    });
  }

  async analyze(): Promise<Partial<RepoAnalysis>> {
    const packageJsonPath = join(this.rootPath, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const framework = this.detectFramework(packageJson);

    this.addSourceFiles();

    return {
      name: packageJson.name || 'unknown',
      description: packageJson.description || '',
      version: packageJson.version || '0.0.0',
      license: packageJson.license || 'MIT',
      framework,
      entryPoints: this.findEntryPoints(packageJson),
      routes: this.findRoutes(framework),
      components: this.findComponents(framework),
      apiEndpoints: this.findApiEndpoints(framework),
      dbModels: this.findDbModels(),
      dependencies: this.parseDeps(packageJson.dependencies || {}, false),
      devDependencies: this.parseDeps(packageJson.devDependencies || {}, true),
    };
  }

  private addSourceFiles(): void {
    const patterns = [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '!**/node_modules/**',
      '!**/dist/**',
      '!**/build/**',
      '!**/.next/**',
      '!**/coverage/**',
    ];

    for (const pattern of patterns) {
      this.project.addSourceFilesAtPaths(join(this.rootPath, pattern));
    }
  }

  private detectFramework(packageJson: any): FrameworkType {
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const scripts = packageJson.scripts || {};

    if (deps.next) return 'nextjs';
    if (deps['@remix-run/react'] || deps['@remix-run/node']) return 'remix';
    if (deps.astro) return 'astro';
    if (deps['@sveltejs/kit']) return 'sveltekit';
    if (deps.nuxt) return 'nuxt';
    if (deps.express || deps.fastify) return deps.fastify ? 'fastify' : 'express';
    if (deps['@tauri-apps/api']) return 'tauri';
    if (deps.electron) return 'electron';
    if (deps['react-native']) return 'react-native';
    if (deps.vite || scripts.dev?.includes('vite')) return 'vite';

    return 'unknown';
  }

  private findEntryPoints(packageJson: any): string[] {
    const entries: string[] = [];

    if (packageJson.main) entries.push(packageJson.main);
    if (packageJson.module) entries.push(packageJson.module);
    if (packageJson['types'] || packageJson.typings) entries.push(packageJson['types'] || packageJson.typings);
    if (packageJson.exports) {
      if (typeof packageJson.exports === 'string') {
        entries.push(packageJson.exports);
      } else if (typeof packageJson.exports === 'object') {
        for (const [key, value] of Object.entries(packageJson.exports)) {
          if (typeof value === 'string') entries.push(value);
          else if (value && typeof value === 'object' && 'import' in value) entries.push(value.import as string);
        }
      }
    }

    return [...new Set(entries)].filter(Boolean);
  }

  private findRoutes(framework: FrameworkType): RouteInfo[] {
    const routes: RouteInfo[] = [];

    switch (framework) {
      case 'nextjs':
        this.findNextJsRoutes(routes);
        break;
      case 'remix':
        this.findRemixRoutes(routes);
        break;
      case 'astro':
        this.findAstroRoutes(routes);
        break;
      case 'express':
      case 'fastify':
        this.findExpressRoutes(routes);
        break;
      default:
        this.findGenericRoutes(routes);
    }

    return routes;
  }

  private findNextJsRoutes(routes: RouteInfo[]): void {
    const appDir = join(this.rootPath, 'app');
    const pagesDir = join(this.rootPath, 'pages');

    if (existsSync(appDir)) {
      this.scanDir(appDir, (file) => {
        if (file.endsWith('page.tsx') || file.endsWith('page.ts')) {
          const relPath = relative(appDir, file);
          const routePath = '/' + relPath
            .replace(/page\.(tsx|ts)$/, '')
            .replace(/\\/g, '/')
            .replace(/\([^)]*\)\//g, '')
            .replace(/\/layout\.(tsx|ts)$/, '');
          routes.push({
            path: routePath || '/',
            file: relPath,
            isDynamic: routePath.includes('['),
          });
        }
      });
    }

    if (existsSync(pagesDir)) {
      this.scanDir(pagesDir, (file) => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const relPath = relative(pagesDir, file);
          const routePath = '/' + relPath
            .replace(/\.(tsx|ts)$/, '')
            .replace(/\\/g, '/')
            .replace(/\/index$/, '');
          routes.push({
            path: routePath || '/',
            file: relPath,
            isDynamic: routePath.includes('['),
          });
        }
      });
    }
  }

  private findRemixRoutes(routes: RouteInfo[]): void {
    const appDir = join(this.rootPath, 'app');
    if (existsSync(appDir)) {
      this.scanDir(appDir, (file) => {
        if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          const relPath = relative(appDir, file);
          if (relPath.includes('route.')) return;
          const routePath = '/' + relPath
            .replace(/\.(tsx|ts)$/, '')
            .replace(/\\/g, '/')
            .replace(/\/index$/, '');
          routes.push({
            path: routePath || '/',
            file: relPath,
            isDynamic: routePath.includes('$') || routePath.includes('['),
          });
        }
      });
    }
  }

  private findAstroRoutes(routes: RouteInfo[]): void {
    const pagesDir = join(this.rootPath, 'src/pages');
    if (existsSync(pagesDir)) {
      this.scanDir(pagesDir, (file) => {
        if (file.endsWith('.astro') || file.endsWith('.md') || file.endsWith('.mdx')) {
          const relPath = relative(pagesDir, file);
          const routePath = '/' + relPath
            .replace(/\.(astro|md|mdx)$/, '')
            .replace(/\\/g, '/')
            .replace(/\/index$/, '');
          routes.push({
            path: routePath || '/',
            file: relPath,
            isDynamic: routePath.includes('['),
          });
        }
      });
    }
  }

  private findExpressRoutes(routes: RouteInfo[]): void {
    const sourceFiles = this.project.getSourceFiles();
    for (const file of sourceFiles) {
      const text = file.getText();
      const routerPatterns = [
        /\.get\(['"`]([^'"`]+)['"`]/g,
        /\.post\(['"`]([^'"`]+)['"`]/g,
        /\.put\(['"`]([^'"`]+)['"`]/g,
        /\.patch\(['"`]([^'"`]+)['"`]/g,
        /\.delete\(['"`]([^'"`]+)['"`]/g,
        /\.all\(['"`]([^'"`]+)['"`]/g,
      ];

      for (const pattern of routerPatterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          routes.push({
            path: match[1],
            file: relative(this.rootPath, file.getFilePath()),
            method: pattern.source.includes('get') ? 'GET' :
                    pattern.source.includes('post') ? 'POST' :
                    pattern.source.includes('put') ? 'PUT' :
                    pattern.source.includes('patch') ? 'PATCH' :
                    pattern.source.includes('delete') ? 'DELETE' : 'ALL',
            isDynamic: match[1].includes(':'),
          });
        }
      }
    }
  }

  private findGenericRoutes(routes: RouteInfo[]): void {
    const sourceFiles = this.project.getSourceFiles();
    for (const file of sourceFiles) {
      const text = file.getText();
      if (text.includes('router.') || text.includes('app.')) {
        this.findExpressRoutes(routes);
      }
    }
  }

  private findComponents(framework: FrameworkType): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    const sourceFiles = this.project.getSourceFiles();

    for (const file of sourceFiles) {
      if (this.isComponentFile(file, framework)) {
        const componentName = this.getComponentName(file);
        const props = this.getComponentProps(file);
        const isPage = this.isPageComponent(file, framework);

        components.push({
          name: componentName,
          file: relative(this.rootPath, file.getFilePath()),
          props,
          isPage,
        });
      }
    }

    return components;
  }

  private isComponentFile(file: SourceFile, framework: FrameworkType): boolean {
    const path = file.getFilePath();
    const text = file.getText();

    if (!path.match(/\.(tsx|jsx|vue|svelte|astro)$/)) return false;
    if (path.includes('node_modules')) return false;
    if (path.includes('.test.') || path.includes('.spec.')) return false;
    if (path.includes('.d.ts')) return false;

    const hasComponentExport = text.includes('export default') ||
                               text.includes('export const') ||
                               text.includes('export function');

    return hasComponentExport;
  }

  private getComponentName(file: SourceFile): string {
    const path = file.getFilePath();
    const baseName = path.split('/').pop()?.replace(/\.(tsx|jsx|vue|svelte|astro)$/, '') || 'Unknown';

    const text = file.getText();
    const defaultExportMatch = text.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (defaultExportMatch) return defaultExportMatch[1];

    const constExportMatch = text.match(/export\s+const\s+(\w+)\s*=/);
    if (constExportMatch) return constExportMatch[1];

    return baseName;
  }

  private getComponentProps(file: SourceFile): string[] {
    const props: string[] = [];
    const text = file.getText();

    const interfaceMatch = text.match(/interface\s+\w+Props\s*{([^}]+)}/);
    if (interfaceMatch) {
      const propLines = interfaceMatch[1].split('\n');
      for (const line of propLines) {
        const propMatch = line.trim().match(/(\w+)\??\s*:/);
        if (propMatch) props.push(propMatch[1]);
      }
    }

    const typeMatch = text.match(/type\s+\w+Props\s*=\s*{([^}]+)}/);
    if (typeMatch) {
      const propLines = typeMatch[1].split('\n');
      for (const line of propLines) {
        const propMatch = line.trim().match(/(\w+)\??\s*:/);
        if (propMatch) props.push(propMatch[1]);
      }
    }

    return [...new Set(props)];
  }

  private isPageComponent(file: SourceFile, framework: FrameworkType): boolean {
    const path = file.getFilePath();
    if (framework === 'nextjs') {
      return path.includes('/app/') && path.endsWith('page.tsx') ||
             path.includes('/pages/') && !path.includes('/api/');
    }
    if (framework === 'remix') {
      return path.includes('/app/routes/') || path.includes('/app/');
    }
    if (framework === 'astro') {
      return path.includes('/pages/');
    }
    return false;
  }

  private findApiEndpoints(framework: FrameworkType): ApiEndpoint[] {
    const endpoints: ApiEndpoint[] = [];

    if (framework === 'nextjs') {
      const apiDir = join(this.rootPath, 'app/api');
      if (existsSync(apiDir)) {
        this.scanDir(apiDir, (file) => {
          if (file.endsWith('route.ts') || file.endsWith('route.tsx')) {
            const relPath = relative(apiDir, file);
            const routePath = '/' + relPath
              .replace(/route\.(ts|tsx)$/, '')
              .replace(/\\/g, '/');
            endpoints.push({
              path: '/api' + routePath,
              method: 'ALL',
              file: relative(this.rootPath, file),
              params: routePath.match(/\[([^\]]+)\]/g)?.map(p => p.slice(1, -1)) || [],
            });
          }
        });
      }

      const pagesApiDir = join(this.rootPath, 'pages/api');
      if (existsSync(pagesApiDir)) {
        this.scanDir(pagesApiDir, (file) => {
          if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const relPath = relative(pagesApiDir, file);
            const routePath = '/' + relPath
              .replace(/\.(ts|tsx)$/, '')
              .replace(/\\/g, '/')
              .replace(/\/index$/, '');
            endpoints.push({
              path: '/api' + routePath,
              method: 'ALL',
              file: relative(this.rootPath, file),
              params: routePath.match(/\[([^\]]+)\]/g)?.map(p => p.slice(1, -1)) || [],
            });
          }
        });
      }
    }

    return endpoints;
  }

  private findDbModels(): DbModel[] {
    const models: DbModel[] = [];
    const sourceFiles = this.project.getSourceFiles();

    for (const file of sourceFiles) {
      const text = file.getText();

      if (text.includes('prisma') || text.includes('drizzle') || text.includes('typeorm') || text.includes('mongoose')) {
        const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
        let match;
        while ((match = modelRegex.exec(text)) !== null) {
          const modelName = match[1];
          const fieldsText = match[2];
          const fields: ModelField[] = [];

          const fieldLines = fieldsText.split('\n');
          for (const line of fieldLines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('//')) continue;
            const fieldMatch = trimmed.match(/(\w+)\s+(\w+)(\??)\s*(?:@.*)?/);
            if (fieldMatch) {
              fields.push({
                name: fieldMatch[1],
                type: fieldMatch[2],
                isRequired: !fieldMatch[3],
                isUnique: trimmed.includes('@unique'),
              });
            }
          }

          models.push({
            name: modelName,
            file: relative(this.rootPath, file.getFilePath()),
            fields,
          });
        }
      }
    }

    return models;
  }

  private parseDeps(deps: Record<string, string>, isDev: boolean): { name: string; version: string; isDev: boolean }[] {
    return Object.entries(deps).map(([name, version]) => ({
      name,
      version: version.replace(/^[\^~]/, ''),
      isDev,
    }));
  }

  private scanDir(dir: string, callback: (file: string) => void): void {
    const fs = require('fs');
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        this.scanDir(fullPath, callback);
      } else {
        callback(fullPath);
      }
    }
  }
}