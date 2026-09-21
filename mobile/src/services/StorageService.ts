import { getDatabase, closeDatabase, resetDatabase } from '@/storage/database';
import type { Device, Task, SystemMetrics, UserPreferences, QueuedRequest } from '@/types';
import type { IStorageService } from '@/types/services';

const CACHE_PREFIX = 'cache_';
const PREF_KEY = 'preferences';
const QUEUE_KEY = 'offline_queue';
const LAST_SYNC_KEY = 'last_sync';
const MAX_CACHE_BYTES = 50 * 1024 * 1024;

class StorageService implements IStorageService {
  private dbPromise: Promise<any> = getDatabase();

  private async getDb() {
    return this.dbPromise;
  }

  // Generic Storage Operations

  async set(key: string, value: any): Promise<void> {
    const db = await this.getDb();
    const serialized = JSON.stringify(value);
    await db.runAsync(
      `INSERT OR REPLACE INTO preferences (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [key, serialized]
    );
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.getDb();
    const row = (await db.getFirstAsync(`SELECT value FROM preferences WHERE key = ?`, [key])) as {
      value: string;
    } | null;
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM preferences WHERE key = ?`, [key]);
  }

  async clear(): Promise<void> {
    const db = await this.getDb();
    await db.runAsync(`DELETE FROM preferences`);
    await db.runAsync(`DELETE FROM outbox`);
  }

  // Cache Management

  async getCacheSize(): Promise<number> {
    const db = await this.getDb();
    const row = (await db.getFirstAsync(
      `SELECT SUM(LENGTH(value)) as total FROM preferences WHERE key LIKE ?`,
      [`${CACHE_PREFIX}%`]
    )) as { total: number } | null;
    return row?.total || 0;
  }

  private async enforceCacheLimit(): Promise<void> {
    const db = await this.getDb();
    const currentSize = await this.getCacheSize();
    if (currentSize <= MAX_CACHE_BYTES) return;

    const rows = (await db.getAllAsync(
      `SELECT key, value FROM preferences WHERE key LIKE ? ORDER BY updated_at ASC`,
      [`${CACHE_PREFIX}%`]
    )) as { key: string; value: string }[];

    let sizeToRemove = currentSize - MAX_CACHE_BYTES;
    for (const row of rows) {
      if (sizeToRemove <= 0) break;
      const itemSize = row.value.length;
      await db.runAsync(`DELETE FROM preferences WHERE key = ?`, [row.key]);
      sizeToRemove -= itemSize;
    }
  }

  // Specific Data Storage

  async cacheDevices(devices: Device[]): Promise<void> {
    await this.set(`${CACHE_PREFIX}devices`, { data: devices, timestamp: Date.now() });
    await this.enforceCacheLimit();
  }

  async getCachedDevices(): Promise<{ data: Device[]; timestamp: number } | null> {
    return this.get(`${CACHE_PREFIX}devices`);
  }

  async cacheTasks(tasks: Task[]): Promise<void> {
    await this.set(`${CACHE_PREFIX}tasks`, { data: tasks, timestamp: Date.now() });
    await this.enforceCacheLimit();
  }

  async getCachedTasks(): Promise<{ data: Task[]; timestamp: number } | null> {
    return this.get(`${CACHE_PREFIX}tasks`);
  }

  async cacheMetrics(metrics: SystemMetrics): Promise<void> {
    await this.set(`${CACHE_PREFIX}metrics`, { data: metrics, timestamp: Date.now() });
    await this.enforceCacheLimit();
  }

  async getCachedMetrics(): Promise<{ data: SystemMetrics; timestamp: number } | null> {
    return this.get(`${CACHE_PREFIX}metrics`);
  }

  // Offline Queue

  async getOfflineQueue(): Promise<QueuedRequest[]> {
    const queue = await this.get<QueuedRequest[]>(QUEUE_KEY);
    return queue || [];
  }

  async addToOfflineQueue(request: QueuedRequest): Promise<void> {
    const queue = await this.getOfflineQueue();
    queue.push(request);
    await this.set(QUEUE_KEY, queue);
  }

  async removeFromOfflineQueue(requestId: string): Promise<void> {
    const queue = await this.getOfflineQueue();
    const filtered = queue.filter(req => req.id !== requestId);
    await this.set(QUEUE_KEY, filtered);
  }

  async clearOfflineQueue(): Promise<void> {
    await this.set(QUEUE_KEY, []);
  }

  // User Preferences

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await this.set(PREF_KEY, preferences);
  }

  async getPreferences(): Promise<UserPreferences | null> {
    return this.get<UserPreferences>(PREF_KEY);
  }

  // Synchronization

  async getLastSyncTimestamp(): Promise<number | null> {
    return this.get<number>(LAST_SYNC_KEY);
  }

  async setLastSyncTimestamp(timestamp: number): Promise<void> {
    await this.set(LAST_SYNC_KEY, timestamp);
  }

  // Lifecycle

  async destroy(): Promise<void> {
    await closeDatabase();
    this.dbPromise = getDatabase();
  }

  async reset(): Promise<void> {
    await resetDatabase();
    this.dbPromise = getDatabase();
  }
}

export const storageService = new StorageService();
export default storageService;
