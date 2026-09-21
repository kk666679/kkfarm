export interface BrowserMetricValues {
  profiles: number;
  sessions: number;
  actions: number;
  proxyRotations: number;
}

export class BrowserMetrics {
  private values: BrowserMetricValues = { profiles: 0, sessions: 0, actions: 0, proxyRotations: 0 };

  set<K extends keyof BrowserMetricValues>(key: K, value: number): void {
    this.values[key] = value;
  }

  increment<K extends keyof BrowserMetricValues>(key: K): void {
    this.values[key] += 1;
  }

  snapshot(): BrowserMetricValues {
    return { ...this.values };
  }
}

export const browserMetrics = new BrowserMetrics();
