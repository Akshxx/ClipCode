import { Worker, Job } from 'bullmq';
import { getRedisClient } from '../redis';
import { renderQueue } from '../queues';
import { PrismaClient } from '@clipcode/db';
import { Social30sComposition } from '@clipcode/templates';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { generateId } from '@clipcode/core';
import { uploadToR2 } from '@clipcode/crawler';

const prisma = new PrismaClient();

interface RenderJobData {
  projectId: string;
  renderId: string;
  template: string;
  data: any;
  config: any;
  r2Upload: boolean;
}

export async function startRenderWorker(): Promise<Worker<RenderJobData>> {
  const worker = new Worker<RenderJobData>(
    'render',
    async (job: Job<RenderJobData>) => {
      const { projectId, renderId, template, data, config, r2Upload } = job.data;

      await prisma.render.update({
        where: { id: renderId },
        data: { status: 'rendering' },
      });

      try {
        const bundleLocation = await bundle({
          entryPoint: join(__dirname, '../../../templates/src/social-30s/Composition.tsx'),
          webpackOverride: (config) => config,
        });

        const composition = await selectComposition({
          serveUrl: bundleLocation,
          id: template,
          inputProps: data,
        });

        const outputPath = join(tmpdir(), 'clipcode-renders', `${renderId}.mp4`);
        mkdirSync(dirname(outputPath), { recursive: true });

        await renderMedia({
          composition,
          serveUrl: bundleLocation,
          outputLocation: outputPath,
          inputProps: data,
          codec: 'h264',
          crf: 23,
          // width, height, frameRate are part of the composition (VideoConfig)
        });

        let videoUrl: string | undefined;
        let hostedUrl: string | undefined;

        if (r2Upload) {
          const uploadResult = await uploadToR2(outputPath, `renders/${projectId}/${renderId}.mp4`, 'video/mp4');
          if (uploadResult) {
            videoUrl = uploadResult;
            hostedUrl = `https://clipcode.dev/r/${renderId}`;
          }
        } else {
          videoUrl = `file://${outputPath}`;
        }

        await prisma.render.update({
          where: { id: renderId },
          data: {
            status: 'completed',
            videoUrl,
            hostedUrl,
            completedAt: new Date(),
          },
        });

        return { videoUrl, hostedUrl };
      } catch (error) {
        await prisma.render.update({
          where: { id: renderId },
          data: { status: 'failed', error: String(error) },
        });
        throw error;
      }
    },
    {
      connection: getRedisClient(),
      concurrency: 1,
    }
  );

  worker.on('error', (err) => {
    console.error('Render worker error:', err);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
  });

  return worker;
}