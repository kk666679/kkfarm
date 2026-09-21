import dotenv from 'dotenv';

dotenv.config();

const config: Record<string, any> = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'device_farm',
      password: process.env.DB_PASSWORD || 'device_farm_dev',
      database: process.env.DB_NAME || 'device_farm_dev',
    },
    pool: {
      min: 2,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    migrations: {
      extension: 'ts',
      directory: './migrations',
    },
    seeds: {
      extension: 'ts',
      directory: './seeds',
    },
  },
  staging: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'device_farm_staging',
    },
    pool: {
      min: 5,
      max: 50,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    migrations: {
      extension: 'ts',
      directory: './migrations',
    },
    seeds: {
      extension: 'ts',
      directory: './seeds',
    },
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    pool: {
      min: 10,
      max: 100,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    migrations: {
      extension: 'ts',
      directory: './migrations',
    },
    seeds: {
      extension: 'ts',
      directory: './seeds',
    },
  },
};

export default config;
