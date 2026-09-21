import pg from 'pg';
import { createPool } from 'generic-pool';

interface PgQueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

interface PgPool {
  on(event: string, listener: (err: Error) => void): this;
  connect(): Promise<PgPoolClient>;
  query<T = any>(text: string, params?: unknown[]): Promise<PgQueryResult<T>>;
  end(): Promise<void>;
}

interface PgPoolClient {
  query<T = any>(text: string, params?: unknown[]): Promise<PgQueryResult<T>>;
  release(): void;
}

interface PgPoolConstructor {
  new (config: any): PgPool;
}

const { Pool: PgPoolClass } = pg as any as { Pool: PgPoolConstructor };

let pool: any = null;

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  idleTimeoutMillis?: number;
}

/**
 * Initialize PostgreSQL connection pool with PgBouncer configuration
 */
export async function initPostgres(config: PostgresConfig): Promise<pg.Pool> {
  if (pool) {
    return pool;
  }

  pool = new PgPoolClass({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    max: config.maxConnections || 20,
    idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err: any) => {
    console.error('PostgreSQL pool error:', err);
  });

  // Test connection
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL connected:', result.rows[0]);
  } finally {
    client.release();
  }

  return pool;
}

/**
 * Get the existing PostgreSQL connection pool
 */
export function getPostgresPool(): any {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized. Call initPostgres first.');
  }
  return pool;
}

/**
 * Close the PostgreSQL connection pool
 */
export async function closePostgres(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Execute a query
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<PgQueryResult<T>> {
  const p = getPostgresPool();
  return (p as any).query(sql, params) as any;
}

/**
 * Execute a query and return the first row
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryAll<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await query<T>(sql, params);
  return result.rows;
}

/**
 * Execute a query without returning results
 */
export async function execute(sql: string, params?: unknown[]): Promise<number> {
  const result = await query(sql, params);
  return result.rowCount || 0;
}
