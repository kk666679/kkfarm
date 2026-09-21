import { create } from 'zustand';
import { apiService } from '@/services/APIService';
import { useGlobalLoading } from './useGlobalLoading';
import type { SystemMetrics, LogEntry } from '@/types';

interface FarmState {
  metrics: SystemMetrics | null;
  logs: LogEntry[];
  isLoading: number;
  error: string | null;
  lastUpdate: number | null;
}

interface FarmActions {
  fetchMetrics: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  addLog: (log: LogEntry) => void;
}

type FarmStore = FarmState & FarmActions;

export const useFarmStore = create<FarmStore>()((set, get) => ({
  metrics: null,
  logs: [],
  isLoading: 0,
  error: null,
  lastUpdate: null,

  fetchMetrics: async () => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('metrics-fetch');
    try {
      const metrics = await apiService.getMetrics();
      set({ metrics, lastUpdate: Date.now(), error: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch metrics' });
    } finally {
      stopLoading('metrics-fetch');
    }
  },

  fetchLogs: async () => {
    const { startLoading, stopLoading } = useGlobalLoading.getState();
    startLoading('logs-fetch');
    try {
      const result = await apiService.getLogs('', undefined, 100);
      const logs: LogEntry[] = result.lines.map((line, index) => ({
        id: `log-${index}`,
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        source: 'system',
        message: line,
        metadata: {},
      }));
      set({ logs, error: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch logs' });
    } finally {
      stopLoading('logs-fetch');
    }
  },

  addLog: (log: LogEntry) => {
    set(state => ({
      logs: [log, ...state.logs].slice(0, 500),
    }));
  },
}));
