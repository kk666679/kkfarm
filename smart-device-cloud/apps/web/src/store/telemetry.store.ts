import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TelemetrySample } from '@smart-device-cloud/shared';

interface TelemetryState {
  latestByDevice: Record<string, TelemetrySample>;
  setLatest: (sample: TelemetrySample) => void;
  setMany: (samples: TelemetrySample[]) => void;
  clear: () => void;
}

export const useTelemetryStore = create<TelemetryState>()(
  devtools((set, _get) => ({
    latestByDevice: {},
    setLatest: sample =>
      set(state => ({
        latestByDevice: { ...state.latestByDevice, [sample.deviceId]: sample },
      })),
    setMany: samples =>
      set(state => {
        const next = { ...state.latestByDevice };
        for (const s of samples) {
          next[s.deviceId] = s;
        }
        return { latestByDevice: next };
      }),
    clear: () => set({ latestByDevice: {} }),
  }))
);
