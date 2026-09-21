import { Queue, QueueOptions } from 'bullmq';
import { getRedisClient } from './redis';
import { RenderJob, CrawlJob } from '@clipcode/core';

const defaultQueueOptions: QueueOptions = {
  connection: getRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
};

export const renderQueue = new Queue<RenderJob>('render', defaultQueueOptions);
export const crawlQueue = new Queue<CrawlJob>('crawl', defaultQueueOptions);

export async function closeQueues(): Promise<void> {
  await Promise.all([
    renderQueue.close(),
    crawlQueue.close(),
  ]);
}