import Queue from 'bull';
import { createRedisClient } from './redis/client';
import { loadWorkloadEnv } from './config/env';
import { workloadSecrets } from './config/secrets';
import { logger } from '@smart-device-cloud/shared/observability';

const { env, config } = loadWorkloadEnv();

logger.info('Workload Manager starting', {
  env: env.NODE_ENV,
  port: config.server.port,
  concurrency: config.queue.concurrency,
});

let redisClient: ReturnType<typeof createRedisClient> | undefined;
let workloadQueue: Queue.Queue | undefined;
let workflowQueue: Queue.Queue | undefined;

async function initRedisUrl(): Promise<string | undefined> {
  if (config.redis.url) return config.redis.url;
  const secretUrl = await workloadSecrets.getRedisUrl();
  if (secretUrl) return secretUrl;
  if (env.NODE_ENV === 'production') {
    throw new Error('REDIS_URL is required in production');
  }
  logger.warn('REDIS_URL not set; running in degraded mode');
  return undefined;
}

async function init(): Promise<void> {
  const redisUrl = await initRedisUrl();
  if (!redisUrl) return;

  redisClient = createRedisClient(redisUrl);
  await redisClient.connect();
  logger.info('Connected to Redis');

  workloadQueue = new Queue('workload-tasks', redisUrl);
  workflowQueue = new Queue('workflow-tasks', redisUrl);

  workloadQueue.process(config.queue.concurrency, async job => {
    logger.info('Processing workload task', { jobId: job.id, data: job.data });
    try {
      await job.progress(100);
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Workload task failed', { jobId: job.id, error });
      throw error;
    }
  });

  workflowQueue.process(config.queue.concurrency, async job => {
    logger.info('Processing workflow task', { jobId: job.id, data: job.data });
    try {
      await job.progress(100);
      return { success: true, jobId: job.id };
    } catch (error) {
      logger.error('Workflow task failed', { jobId: job.id, error });
      throw error;
    }
  });

  workloadQueue.on('completed', job => {
    logger.info('Workload task completed', { jobId: job.id });
  });

  workloadQueue.on('failed', (job, error) => {
    logger.error('Workload task failed', { jobId: job?.id, error });
  });
}

init().catch(error => {
  logger.error('Failed to initialize Workload Manager', { error });
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (workloadQueue) await workloadQueue.close();
  if (workflowQueue) await workflowQueue.close();
  if (redisClient) await redisClient.quit();
  logger.info('Workload Manager shut down');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (workloadQueue) await workloadQueue.close();
  if (workflowQueue) await workflowQueue.close();
  if (redisClient) await redisClient.quit();
  process.exit(0);
});

logger.info('Workload Manager started');

export { workloadQueue, workflowQueue, redisClient };
export { loadWorkloadEnv };
export { WorkloadEnvSchema } from './config/env';
export type { WorkloadEnvConfig, WorkloadConfig } from './config/env';
export * from './redis/types';
