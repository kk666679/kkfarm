import { createClient } from 'redis';

let redisClient: any = null;

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  enableOfflineQueue?: boolean;
}

/**
 * Redis key naming conventions
 */
export const REDIS_KEYS = {
  CACHE: (key: string) => `cache:${key}`,
  TELEMETRY_BUFFER: (deviceId: string) => `telemetry:${deviceId}`,
  DEVICE_STATE: (deviceId: string) => `device:${deviceId}`,
  WORKLOAD_QUEUE: () => 'queue:workloads',
  WORKFLOW_QUEUE: () => 'queue:workflows',
  SESSION: (sessionId: string) => `session:${sessionId}`,
  LOCK: (resource: string) => `lock:${resource}`,
  RATE_LIMIT: (userId: string) => `ratelimit:${userId}`,
};

/**
 * Initialize Redis connection with connection pooling
 */
export async function initRedis(config: RedisConfig): Promise<any> {
  if (redisClient) {
    return redisClient;
  }

  const client = createClient({
    socket: {
      host: config.host,
      port: config.port,
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          console.error('Max Redis reconnection attempts reached');
          return new Error('Max retries');
        }
        return retries * 50;
      },
    },
    password: config.password,
  });

  client.on('error', (err: Error) => {
    console.error('Redis connection error:', err);
  });

  client.on('connect', () => {
    console.log('Redis connected');
  });

  client.on('ready', () => {
    console.log('Redis ready');
  });

  client.on('reconnecting', () => {
    console.log('Redis reconnecting');
  });

  if (config.db) {
    (client as any).select(config.db);
  }

  await client.connect();
  redisClient = client;
  return client;
}

/**
 * Get the Redis client
 */
export function getRedisClient(): any {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initRedis first.');
  }
  return redisClient;
}

/**
 * Close the Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

/**
 * Set a cache value with TTL
 */
export async function setCache(
  key: string,
  value: string | number | Record<string, unknown>,
  ttlSeconds: number = 3600
): Promise<void> {
  const client = getRedisClient();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  await client.setEx(key, ttlSeconds, serialized);
}

/**
 * Get a cache value
 */
export async function getCache<T = unknown>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

/**
 * Delete a cache value
 */
export async function deleteCache(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}

/**
 * Increment a counter
 */
export async function incrementCounter(key: string, amount: number = 1): Promise<number> {
  const client = getRedisClient();
  return client.incrBy(key, amount);
}

/**
 * Push to a list (for telemetry buffering)
 */
export async function pushToBuffer(key: string, value: Record<string, unknown>): Promise<void> {
  const client = getRedisClient();
  const serialized = JSON.stringify(value);
  await client.rPush(key, serialized);

  // Keep list size manageable (e.g., last 1000 items per device)
  await client.lTrim(key, -1000, -1);

  // Set TTL on the list key (24 hours)
  await client.expire(key, 86400);
}

/**
 * Get all items from a buffer
 */
export async function getBuffer<T = Record<string, unknown>>(key: string): Promise<T[]> {
  const client = getRedisClient();
  const items = await client.lRange(key, 0, -1);
  return items.map((item: string) => JSON.parse(item) as T);
}

/**
 * Clear a buffer
 */
export async function clearBuffer(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}
