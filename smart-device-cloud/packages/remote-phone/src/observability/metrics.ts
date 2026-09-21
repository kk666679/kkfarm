export interface RemoteMetricValues {
  sessions: number;
  frames: number;
  transfers: number;
  recordings: number;
}

export class RemoteMetrics {
  private values: RemoteMetricValues = { sessions: 0, frames: 0, transfers: 0, recordings: 0 };

  increment<K extends keyof RemoteMetricValues>(key: K): void {
    this.values[key] += 1;
  }

  snapshot(): RemoteMetricValues {
    return { ...this.values };
  }
}

export const remoteMetrics = new RemoteMetrics();
