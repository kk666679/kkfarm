import { createClient } from 'redis';
import { createDatabaseClients } from './db/client';
import { loadAnalyticsEnv } from './config/env';
import { analyticsSecrets } from './config/secrets';
import { logger } from '@smart-device-cloud/shared/observability';

const { env, config } = loadAnalyticsEnv();

logger.info('Analytics Service starting', {
  env: env.NODE_ENV,
  port: config.server.port,
});

async function initRedisUrl(): Promise<string | undefined> {
  if (config.redis.url) return config.redis.url;
  const secretUrl = await analyticsSecrets.getRedisUrl();
  if (secretUrl) return secretUrl;
  if (env.NODE_ENV === 'production') {
    throw new Error('REDIS_URL is required in production');
  }
  logger.warn('REDIS_URL not set; running in degraded mode');
  return undefined;
}

async function initDatabaseUrl(): Promise<string | undefined> {
  if (config.postgres.connectionString) return config.postgres.connectionString;
  const secretUrl = await analyticsSecrets.getDatabaseUrl();
  if (secretUrl) return secretUrl;
  if (env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production');
  }
  logger.warn('DATABASE_URL not set; database features disabled');
  return undefined;
}

let redisClient: ReturnType<typeof createClient> | undefined;
let dbClients: Awaited<ReturnType<typeof createDatabaseClients>> | undefined;

async function init(): Promise<void> {
  const redisUrl = await initRedisUrl();
  if (redisUrl) {
    redisClient = createClient({ url: redisUrl });
    await redisClient.connect();
    logger.info('Connected to Redis');
  }

  dbClients = createDatabaseClients({
    ...config,
    postgres: { connectionString: await initDatabaseUrl() },
  });

  if (dbClients.postgres) {
    await dbClients.postgres.query('SELECT NOW()');
    logger.info('Connected to PostgreSQL');
  }
  if (dbClients.timeseries) {
    await dbClients.timeseries.query('SELECT NOW()');
    logger.info('Connected to TimescaleDB');
  }
}

init().catch(error => {
  logger.error('Failed to initialize Analytics Service', { error });
  process.exit(1);
});

const startAnalyticsAggregation = () => {
  const interval = env.ANALYTICS_AGGREGATION_INTERVAL;
  setInterval(async () => {
    try {
      logger.debug('Running analytics aggregation');
    } catch (error) {
      logger.error('Analytics aggregation failed', { error });
    }
  }, interval);
};

startAnalyticsAggregation();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (redisClient) await redisClient.quit();
  if (dbClients) await dbClients.closeAll();
  logger.info('Analytics Service shut down');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (redisClient) await redisClient.quit();
  if (dbClients) await dbClients.closeAll();
  process.exit(0);
});

logger.info('Analytics Service started');

export { redisClient, dbClients };
export { loadAnalyticsEnv };
export { AnalyticsEnvSchema } from './config/env';
export type { AnalyticsEnvConfig, AnalyticsConfig } from './config/env';
export * from './db/client';
export * from './db/types';
