interface DeviceAiMetricValues {
  analyses: number;
  recommendations: number;
  actionsApproved: number;
  actionsExecuted: number;
}

export class DeviceAiMetrics {
  private values: DeviceAiMetricValues = {
    analyses: 0,
    recommendations: 0,
    actionsApproved: 0,
    actionsExecuted: 0,
  };

  increment<K extends keyof DeviceAiMetricValues>(key: K): void {
    this.values[key] += 1;
  }

  snapshot(): DeviceAiMetricValues {
    return { ...this.values };
  }
}

export const deviceAiMetrics = new DeviceAiMetrics();
