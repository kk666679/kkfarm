import * as SQLite from 'expo-sqlite';

const DB_NAME = 'phonefarm.db';
const DB_VERSION = 1;

let database: any = null;

export const getDatabase = async (): Promise<any> => {
  if (database) return database;

  database = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(database, DB_VERSION);
  return database;
};

const runMigrations = async (db: any, version: number): Promise<void> => {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  if (version >= 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        status TEXT NOT NULL,
        battery_level REAL NOT NULL DEFAULT 0,
        last_seen TEXT NOT NULL,
        capabilities TEXT NOT NULL DEFAULT '[]',
        current_task_id TEXT,
        connection_type TEXT NOT NULL,
        metadata TEXT NOT NULL DEFAULT '{}',
        provider TEXT NOT NULL,
        android_version TEXT,
        updated_at TEXT NOT NULL,
        api_level INTEGER DEFAULT 0,
        adb_host TEXT,
        adb_port INTEGER DEFAULT 0,
        version INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
      CREATE INDEX IF NOT EXISTS idx_devices_platform ON devices(platform);
      CREATE INDEX IF NOT EXISTS idx_devices_deleted_at ON devices(deleted_at);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'normal',
        configuration TEXT NOT NULL DEFAULT '{}',
        assigned_devices TEXT NOT NULL DEFAULT '[]',
        progress REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        created_by TEXT NOT NULL,
        error TEXT,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        payload TEXT NOT NULL DEFAULT '{}',
        version INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS device_metrics (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        cpu_usage REAL NOT NULL DEFAULT 0,
        memory_usage REAL NOT NULL DEFAULT 0,
        battery_level REAL NOT NULL DEFAULT 0,
        temperature REAL NOT NULL DEFAULT 0,
        storage_used REAL NOT NULL DEFAULT 0,
        network_latency REAL NOT NULL DEFAULT 0,
        FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_device_metrics_device_id ON device_metrics(device_id);
      CREATE INDEX IF NOT EXISTS idx_device_metrics_timestamp ON device_metrics(timestamp);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS outbox (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL CHECK(operation IN ('insert', 'update', 'delete')),
        record_id TEXT NOT NULL,
        data TEXT NOT NULL DEFAULT '{}',
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 5,
        last_error TEXT,
        status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'dead_letter'))
      );
      CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
      CREATE INDEX IF NOT EXISTS idx_outbox_timestamp ON outbox(timestamp);
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '{}',
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        stack TEXT,
        context TEXT DEFAULT '{}',
        source TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
    `);
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
    database = null;
  }
};

export const resetDatabase = async (): Promise<void> => {
  if (database) {
    await database.closeAsync();
    database = null;
  }
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync('DROP TABLE IF EXISTS error_logs;');
  await db.execAsync('DROP TABLE IF EXISTS preferences;');
  await db.execAsync('DROP TABLE IF EXISTS outbox;');
  await db.execAsync('DROP TABLE IF EXISTS device_metrics;');
  await db.execAsync('DROP TABLE IF EXISTS tasks;');
  await db.execAsync('DROP TABLE IF EXISTS devices;');
  await db.closeAsync();
  database = null;
};
