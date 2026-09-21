import initSqlJs, { SqlJsStatic, Database as SqlJsDatabase } from 'sql.js';
import type { QueryExecResult } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'device-farm.db');

let SQL: SqlJsStatic;
export let db: SqlJsDatabase;

export async function initDatabase() {
  if (db) {
    return db;
  }
  SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer.buffer as unknown as ArrayLike<number>);
  } else {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    db = new SQL.Database();
  }
  return db;
}

export function run(sql: string, params: unknown[] = []): void {
  db.run(sql, params);
}

export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

export function get<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): T | undefined {
  const rows = all<T>(sql, params);
  return rows[0];
}

export function runMigrations() {
  db.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      serial TEXT,
      android_version TEXT,
      api_level INTEGER,
      status TEXT NOT NULL DEFAULT 'offline',
      container_id TEXT,
      adb_host TEXT,
      adb_port INTEGER,
      assigned_task_id TEXT,
      last_heartbeat TEXT,
      group_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_devices_group_id ON devices(group_id)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      device_id TEXT,
      priority INTEGER NOT NULL DEFAULT 0,
      payload TEXT NOT NULL DEFAULT '{}',
      progress INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      started_at TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS task_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id TEXT NOT NULL,
      event TEXT NOT NULL,
      data TEXT NOT NULL DEFAULT '{}',
      timestamp TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cron TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      enabled INTEGER NOT NULL DEFAULT 1,
      task_template TEXT NOT NULL DEFAULT '{}',
      last_run_at TEXT,
      next_run_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS device_profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      created_by TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      category TEXT DEFAULT 'standard',
      priority TEXT DEFAULT 'medium',
      applicable_devices TEXT DEFAULT '[]',
      content TEXT NOT NULL DEFAULT '{}'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS device_profile_versions (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      version INTEGER NOT NULL,
      changes TEXT,
      changed_by TEXT,
      changed_at TEXT NOT NULL DEFAULT (datetime('now')),
      content TEXT NOT NULL DEFAULT '{}'
    )
  `);

  db.run(
    `CREATE INDEX IF NOT EXISTS idx_device_profile_versions_profile_id ON device_profile_versions(profile_id)`
  );

  db.run(`
    CREATE TABLE IF NOT EXISTS device_groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parent_id TEXT,
      path TEXT NOT NULL,
      device_count INTEGER NOT NULL DEFAULT 0,
      online_count INTEGER NOT NULL DEFAULT 0,
      offline_count INTEGER NOT NULL DEFAULT 0,
      maintenance_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      assigned_to TEXT,
      tags TEXT DEFAULT '[]',
      metadata TEXT DEFAULT '{}'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS device_providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'disconnected',
      location TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      platform TEXT,
      permissions TEXT DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      package_name TEXT NOT NULL,
      version_name TEXT NOT NULL DEFAULT '1.0.0',
      version_code INTEGER NOT NULL DEFAULT 1,
      min_sdk INTEGER,
      target_sdk INTEGER,
      install_status TEXT NOT NULL DEFAULT 'pending',
      health_status TEXT NOT NULL DEFAULT 'unknown',
      apk_url TEXT,
      apk_hash TEXT,
      size_bytes INTEGER,
      installed_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      permissions TEXT DEFAULT '[]',
      installed_device_count INTEGER NOT NULL DEFAULT 0,
      healthy_device_count INTEGER NOT NULL DEFAULT 0,
      failed_device_count INTEGER NOT NULL DEFAULT 0,
      previous_version_name TEXT,
      previous_version_code INTEGER,
      last_deployed_at TEXT
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_applications_package_name ON applications(package_name)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_task_events_task_id ON task_events(task_id)`);
}

export function seedTestData() {
  const existing = get<{ id: string }>('SELECT id FROM users WHERE username = ?', ['admin']);
  if (!existing) {
    const hashedPassword = bcrypt.hashSync('admin', 10);
    run('INSERT INTO users (id, username, password) VALUES (?, ?, ?)', [
      'admin',
      'admin',
      hashedPassword,
    ]);
  }

  if (!get<{ id: string }>('SELECT id FROM device_providers LIMIT 1')) {
    run(`INSERT INTO device_providers (id, name, type, status, location) VALUES (?, ?, ?, ?, ?)`, [
      'provider-1',
      'Local Emulator',
      'emulator',
      'connected',
      'local',
    ]);
    run(`INSERT INTO device_providers (id, name, type, status, location) VALUES (?, ?, ?, ?, ?)`, [
      'provider-2',
      'Cloud Farm',
      'cloud',
      'connected',
      'us-east-1',
    ]);
    run(`INSERT INTO device_providers (id, name, type, status, location) VALUES (?, ?, ?, ?, ?)`, [
      'provider-3',
      'Real Devices',
      'real_device',
      'disconnected',
      'lab-1',
    ]);
  }

  if (!get<{ id: string }>('SELECT id FROM accounts LIMIT 1')) {
    run(
      `INSERT INTO accounts (id, name, email, role, platform, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
      ['account-1', 'Engineering', 'eng@example.com', 'user', 'android', '["read","write"]']
    );
    run(
      `INSERT INTO accounts (id, name, email, role, platform, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
      ['account-2', 'QA Team', 'qa@example.com', 'user', 'android', '["read"]']
    );
  }

  if (!get<{ id: string }>('SELECT id FROM applications LIMIT 1')) {
    run(
      `INSERT INTO applications (id, package_name, version_name, version_code, install_status, health_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['app-1', 'com.example.chrome', '120.0', 120, 'installed', 'healthy']
    );
    run(
      `INSERT INTO applications (id, package_name, version_name, version_code, install_status, health_status) VALUES (?, ?, ?, ?, ?, ?)`,
      ['app-2', 'com.example.firefox', '122.0', 122, 'pending', 'unknown']
    );
  }

  if (!get<{ id: string }>('SELECT id FROM device_groups LIMIT 1')) {
    run(`INSERT INTO device_groups (id, name, description, path, status) VALUES (?, ?, ?, ?, ?)`, [
      'group-1',
      'Production',
      'Production devices',
      '/Production',
      'active',
    ]);
    run(
      `INSERT INTO device_groups (id, name, description, parent_id, path, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        'group-2',
        'Pixel Devices',
        'Google Pixel lineup',
        'group-1',
        '/Production/Pixel Devices',
        'active',
      ]
    );
  }

  if (!get<{ id: string }>('SELECT id FROM device_profiles LIMIT 1')) {
    const profileContent = JSON.stringify({
      general: { name: 'Standard Android', category: 'standard', priority: 'medium' },
      device: { manufacturer: 'Google', model: 'Pixel' },
      android: { version: '14', locale: 'en-US', timezone: 'UTC' },
    });
    run(
      `INSERT INTO device_profiles (id, name, description, status, tags, version, is_active, category, priority, applicable_devices, content, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'profile-1',
        'Standard Android Profile',
        'Default Android configuration',
        'published',
        '["android","standard"]',
        1,
        1,
        'standard',
        'medium',
        '["pixel"]',
        profileContent,
        'admin',
      ]
    );
    run(
      `INSERT INTO device_profile_versions (id, profile_id, version, changes, changed_by, content) VALUES (?, ?, ?, ?, ?, ?)`,
      ['version-1', 'profile-1', 1, 'Initial version', 'admin', profileContent]
    );
  }
}
