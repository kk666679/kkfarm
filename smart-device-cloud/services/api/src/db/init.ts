import { initPostgres } from './postgres.ts';
import { initRedis } from './redis.ts';
import { runMigrations } from './database.ts';

/**
 * Initialize all databases on startup
 */
export async function initializeDatabases() {
  const postgresConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'device_farm_dev',
    user: process.env.DB_USER || 'device_farm',
    password: process.env.DB_PASSWORD || 'device_farm_dev',
    maxConnections: 20,
    idleTimeoutMillis: 30000,
  };

  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };

  console.log('Initializing databases...');
  console.log(
    `PostgreSQL: ${postgresConfig.host}:${postgresConfig.port}/${postgresConfig.database}`
  );
  console.log(`Redis: ${redisConfig.host}:${redisConfig.port}`);

  try {
    // Initialize PostgreSQL
    await initPostgres(postgresConfig);
    console.log('✓ PostgreSQL connected');

    // Run migrations
    await runMigrations();
    console.log('✓ Migrations completed');

    // Initialize Redis
    await initRedis(redisConfig);
    console.log('✓ Redis connected');

    console.log('✓ All databases initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Check all database health
 */
export async function checkDatabaseHealth() {
  const health = {
    postgres: false,
    redis: false,
  };

  try {
    const pool = require('./postgres').getPostgresPool();
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      health.postgres = true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    const redis = require('./redis').getRedisClient();
    await redis.ping();
    health.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return health;
}
