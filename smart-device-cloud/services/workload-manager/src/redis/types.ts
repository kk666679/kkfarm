import type { RedisClientType, RedisClientOptions } from 'redis';

export type RedisClient = RedisClientType;

export interface RedisConnectionOptions {
  url?: string;
  socket?: RedisClientOptions['socket'];
}

export interface RedisPool {
  clients: Map<string, RedisClient>;
  defaultClient: RedisClient | undefined;
  closeAll(): Promise<void>;
}

export { RedisClientType, RedisClientOptions };
