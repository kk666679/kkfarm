import { getDatabase } from '@/storage/database';
import { sanitizeForLogging } from '@/utils/Sanitization';
import type { ErrorLogEntry } from '@/types';

const MAX_LOGS = 100;

export const ErrorLogger = {
  async log(error: Error, context?: any, source?: string): Promise<void> {
    try {
      const db = await getDatabase();
      const entry: ErrorLogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        context: context ? sanitizeForLogging(context) : undefined,
        source: source || 'unknown',
      };

      await db.runAsync(
        `INSERT INTO error_logs (id, timestamp, level, message, stack, context, source) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.timestamp,
          'error',
          entry.message,
          entry.stack || '',
          JSON.stringify(entry.context || {}),
          entry.source,
        ]
      );

      await this.prune();
    } catch (logError) {
      console.error('[ErrorLogger] Failed to log error:', logError);
    }
  },

  async prune(): Promise<void> {
    try {
      const db = await getDatabase();
      const rows = (await db.getAllAsync(
        `SELECT id FROM error_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
        [MAX_LOGS, MAX_LOGS]
      )) as { id: string }[];
      for (const row of rows) {
        await db.runAsync(`DELETE FROM error_logs WHERE id = ?`, [row.id]);
      }
    } catch (pruneError) {
      console.error('[ErrorLogger] Prune error:', pruneError);
    }
  },

  async getAll(): Promise<ErrorLogEntry[]> {
    try {
      const db = await getDatabase();
      const rows = (await db.getAllAsync(
        `SELECT * FROM error_logs ORDER BY timestamp DESC LIMIT 100`
      )) as any[];
      return rows.map((row: any) => ({
        ...row,
        context: row.context ? JSON.parse(row.context) : undefined,
      }));
    } catch {
      return [];
    }
  },

  async clear(): Promise<void> {
    try {
      const db = await getDatabase();
      await db.runAsync(`DELETE FROM error_logs`);
    } catch (error) {
      console.error('[ErrorLogger] Clear error:', error);
    }
  },
};

export default ErrorLogger;
