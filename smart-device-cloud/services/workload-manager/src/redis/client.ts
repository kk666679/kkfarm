import { createClient } from 'redis';
import type { RedisClient, RedisPool } from './types';

export function createRedisClient(url?: string): RedisClient {
  return url === undefined ? createClient() : createClient({ url });
}

export function createRedisPool(): RedisPool {
  return {
    clients: new Map(),
    defaultClient: undefined,
    async closeAll() {
      for (const client of this.clients.values()) {
        await client.quit();
      }
      if (this.defaultClient) await this.defaultClient.quit();
      this.clients.clear();
    },
  };
}

export { createClient };
