import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Alert } from '@smart-device-cloud/shared';

interface AlertState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  resolveAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>()(
  devtools((set, _get) => ({
    alerts: [],
    setAlerts: alerts => set({ alerts }),
    addAlert: alert =>
      set(state => {
        const exists = state.alerts.some(a => a.id === alert.id);
        if (exists) {
          return {
            alerts: state.alerts.map(a => (a.id === alert.id ? alert : a)),
          };
        }
        return { alerts: [alert, ...state.alerts].slice(0, 50) };
      }),
    resolveAlert: id =>
      set(state => ({
        alerts: state.alerts
          .map(a => (a.id === id ? { ...a, status: 'resolved' as const } : a))
          .filter(a => a.status !== 'resolved'),
      })),
  }))
);
