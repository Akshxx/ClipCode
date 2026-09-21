import { z } from 'zod';

export const Social30sSchema = z.object({
  hook: z.object({
    problem: z.string().min(1).max(200),
    repoName: z.string().min(1).max(100),
    logoUrl: z.string().url().optional(),
  }),
  reveal: z.object({
    screenshotUrl: z.string().url(),
    tagline: z.string().min(1).max(150),
  }),
  features: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        desc: z.string().min(1).max(200),
        icon: z.string().optional(),
      })
    )
    .length(3),
  demo: z.object({
    recordingUrl: z.string().url().optional(),
    terminalCommands: z.array(z.string()).max(5).optional(),
  }),
  cta: z.object({
    githubUrl: z.string().url(),
    stars: z.number().int().nonnegative(),
    liveUrl: z.string().url().optional(),
  }),
});

export type Social30sData = z.infer<typeof Social30sSchema>;

export const CrawlConfigSchema = z.object({
  url: z.string().url(),
  depth: z.enum(['quick', 'full']).default('quick'),
  viewports: z.array(z.enum(['desktop', 'mobile', 'tablet'])).default(['desktop', 'mobile']),
  pages: z.array(z.string()).default(['/', '/features', '/pricing', '/docs']),
  interactions: z.array(z.object({
    action: z.enum(['click', 'scroll', 'type', 'wait']),
    selector: z.string().optional(),
    value: z.string().optional(),
    waitFor: z.string().optional(),
  })).default([]),
  auth: z.object({
    type: z.enum(['none', 'credentials', 'cookies']),
    username: z.string().optional(),
    password: z.string().optional(),
    cookies: z.array(z.object({
      name: z.string(),
      value: z.string(),
      domain: z.string(),
    })).optional(),
  }).default({ type: 'none' }),
  lighthouse: z.boolean().default(true),
  captureNetwork: z.boolean().default(true),
  maxDuration: z.number().int().positive().default(60),
});

export type CrawlConfig = z.infer<typeof CrawlConfigSchema>;

export const RenderConfigSchema = z.object({
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  fps: z.number().int().positive().default(30),
  duration: z.number().int().positive().default(30),
  quality: z.enum(['720p', '1080p', '4k']).default('1080p'),
  watermark: z.boolean().default(true),
});

export type RenderConfig = z.infer<typeof RenderConfigSchema>;