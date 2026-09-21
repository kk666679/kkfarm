import type { Pool, PoolConfig } from 'pg';
import { Pool as PgPool } from 'pg';
import type { AnalyticsConfig } from '../config/env';

export interface DatabaseClients {
  postgres: Pool | undefined;
  timeseries: Pool | undefined;
  closeAll(): Promise<void>;
}

export function createDatabaseClients(config: AnalyticsConfig): DatabaseClients {
  const postgres = config.postgres.connectionString
    ? new PgPool({
        connectionString: config.postgres.connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      })
    : undefined;

  const timeseries = config.timeseries.host
    ? new PgPool({
        host: config.timeseries.host,
        port: config.timeseries.port,
        user: config.timeseries.user,
        password: config.timeseries.password,
        database: config.timeseries.database,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      } as PoolConfig)
    : undefined;

  return {
    postgres,
    timeseries,
    async closeAll() {
      if (postgres) await postgres.end();
      if (timeseries) await timeseries.end();
    },
  };
}

export type { Pool, PoolConfig };
