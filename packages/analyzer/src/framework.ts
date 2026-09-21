import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { FrameworkType } from '@clipcode/core';

export function detectFramework(rootPath: string): FrameworkType {
  const packageJsonPath = join(rootPath, 'package.json');
  if (!existsSync(packageJsonPath)) return 'unknown';

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const scripts = packageJson.scripts || {};

  if (deps.next) return 'nextjs';
  if (deps['@remix-run/react'] || deps['@remix-run/node']) return 'remix';
  if (deps.astro) return 'astro';
  if (deps['@sveltejs/kit']) return 'sveltekit';
  if (deps.nuxt) return 'nuxt';
  if (deps.fastify) return 'fastify';
  if (deps.express) return 'express';
  if (deps['@tauri-apps/api']) return 'tauri';
  if (deps.electron) return 'electron';
  if (deps['react-native']) return 'react-native';
  if (deps.vite || scripts.dev?.includes('vite')) return 'vite';

  return 'unknown';
}

export function getFrameworkConfig(framework: FrameworkType) {
  const configs: Record<FrameworkType, { routesDir: string; componentsDir: string; apiDir: string }> = {
    nextjs: { routesDir: 'app', componentsDir: 'components', apiDir: 'app/api' },
    vite: { routesDir: 'src/pages', componentsDir: 'src/components', apiDir: 'src/api' },
    remix: { routesDir: 'app/routes', componentsDir: 'app/components', apiDir: 'app/routes/api' },
    astro: { routesDir: 'src/pages', componentsDir: 'src/components', apiDir: 'src/pages/api' },
    sveltekit: { routesDir: 'src/routes', componentsDir: 'src/lib/components', apiDir: 'src/routes/api' },
    nuxt: { routesDir: 'pages', componentsDir: 'components', apiDir: 'server/api' },
    express: { routesDir: 'routes', componentsDir: 'views', apiDir: 'routes' },
    fastify: { routesDir: 'routes', componentsDir: 'views', apiDir: 'routes' },
    tauri: { routesDir: 'src', componentsDir: 'src/components', apiDir: 'src-tauri' },
    electron: { routesDir: 'src', componentsDir: 'src/components', apiDir: 'src/main' },
    'react-native': { routesDir: 'src/screens', componentsDir: 'src/components', apiDir: 'src/api' },
    unknown: { routesDir: '', componentsDir: '', apiDir: '' },
  };

  return configs[framework] || configs.unknown;
}