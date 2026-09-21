import { startRenderWorker } from '@clipcode/queue/workers/render-worker';
import { closeRedis, closeQueues } from '@clipcode/queue';

async function main() {
  console.log('[Start] Starting ClipCode render worker...');

  const worker = await startRenderWorker();

  console.log('[OK] Render worker started');

  const shutdown = async () => {
    console.log('\n[Stop] Shutting down...');
    await worker.close();
    await closeQueues();
    await closeRedis();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[Error] Worker failed:', err);
  process.exit(1);
});