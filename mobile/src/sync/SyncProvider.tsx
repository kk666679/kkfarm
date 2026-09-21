import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { getDatabase } from '@/storage/database';
import { storageService } from '@/services/StorageService';
import type {
  SyncResult,
  SyncOperation,
  SyncError,
  ConflictResolutionStrategy,
  DeadLetterEntry,
} from '@/types/services';

interface SyncContextValue {
  sync: () => Promise<SyncResult>;
  isSyncing: boolean;
  lastSyncResult: SyncResult | null;
  pendingCount: number;
  deadLetters: DeadLetterEntry[];
}

const SyncContext = createContext<SyncContextValue | null>(null);

const SYNC_INTERVAL = 30000;
const MAX_RETRIES = 5;

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncResult, setLastSyncResult] = React.useState<SyncResult | null>(null);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [deadLetters, setDeadLetters] = React.useState<DeadLetterEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sync = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing) {
      return { success: false, syncedCount: 0, failedCount: 0, errors: [] };
    }

    setIsSyncing(true);
    try {
      const db = await getDatabase();
      const pendingOps = (await db.getAllAsync(
        `SELECT * FROM outbox WHERE status = 'pending' OR status = 'failed' ORDER BY timestamp ASC LIMIT 100`
      )) as any[];

      let syncedCount = 0;
      let failedCount = 0;
      const errors: SyncError[] = [];

      for (const op of pendingOps) {
        try {
          await processSyncOperation(db, op);
          await db.runAsync(`UPDATE outbox SET status = 'completed' WHERE id = ?`, [op.id]);
          syncedCount++;
        } catch (error) {
          const newRetryCount = op.retryCount + 1;
          if (newRetryCount >= op.maxRetries) {
            await db.runAsync(
              `UPDATE outbox SET status = 'dead_letter', retry_count = ?, last_error = ? WHERE id = ?`,
              [newRetryCount, String(error), op.id]
            );
            setDeadLetters(prev => [
              ...prev,
              {
                id: op.id,
                operation: op,
                error: String(error),
                attempts: newRetryCount,
                lastAttempt: Date.now(),
              },
            ]);
          } else {
            await db.runAsync(`UPDATE outbox SET retry_count = ?, last_error = ? WHERE id = ?`, [
              newRetryCount,
              String(error),
              op.id,
            ]);
          }
          failedCount++;
          errors.push({ operationId: op.id, error: String(error), timestamp: Date.now() });
        }
      }

      const result: SyncResult = { success: failedCount === 0, syncedCount, failedCount, errors };
      setLastSyncResult(result);
      await storageService.setLastSyncTimestamp(Date.now());
      await updatePendingCount();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const updatePendingCount = async () => {
    try {
      const db = await getDatabase();
      const row = (await db.getFirstAsync(
        `SELECT COUNT(*) as count FROM outbox WHERE status IN ('pending', 'failed')`
      )) as { count: number } | null;
      setPendingCount(row?.count || 0);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      sync();
    }, SYNC_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sync]);

  useEffect(() => {
    updatePendingCount();
  }, []);

  return (
    <SyncContext.Provider value={{ sync, isSyncing, lastSyncResult, pendingCount, deadLetters }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = (): SyncContextValue => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

const processSyncOperation = async (db: any, op: SyncOperation): Promise<void> => {
  const table = op.table;
  const recordId = op.recordId;
  const data = JSON.parse(op.data);

  switch (op.operation) {
    case 'insert':
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data)
        .map(() => '?')
        .join(', ');
      const values = Object.values(data);
      await db.runAsync(
        `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${placeholders})`,
        values
      );
      break;
    case 'update':
      const setClause = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      const updateValues = [...Object.values(data), recordId];
      await db.runAsync(`UPDATE ${table} SET ${setClause} WHERE id = ?`, updateValues);
      break;
    case 'delete':
      await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [recordId]);
      break;
  }
};

export const useSyncMutation = () => {
  const { sync } = useSync();

  const mutate = useCallback(
    async (table: string, operation: 'insert' | 'update' | 'delete', data: any): Promise<void> => {
      const db = await getDatabase();
      const recordId = data.id || `${Date.now()}-${Math.random()}`;
      const operationData: SyncOperation = {
        id: `${Date.now()}-${Math.random()}`,
        table,
        operation,
        recordId,
        data: JSON.stringify(data),
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: MAX_RETRIES,
        lastError: null,
        status: 'pending',
      };

      await db.runAsync(
        `INSERT INTO outbox (id, table_name, operation, record_id, data, timestamp, retry_count, max_retries, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          operationData.id,
          table,
          operation,
          recordId,
          JSON.stringify(data),
          Date.now(),
          0,
          MAX_RETRIES,
          'pending',
        ]
      );

      await sync();
    },
    [sync]
  );

  return { mutate };
};

export const useManualSync = () => {
  const { sync, isSyncing, lastSyncResult } = useSync();

  const triggerSync = useCallback(async () => {
    const result = await sync();
    return result;
  }, [sync]);

  return { triggerSync, isSyncing, lastSyncResult };
};
