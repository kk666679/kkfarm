export interface IntegrationMetricValues {
  deliveries: number;
  failures: number;
  retries: number;
}

export class IntegrationMetrics {
  private values: IntegrationMetricValues = { deliveries: 0, failures: 0, retries: 0 };

  increment<K extends keyof IntegrationMetricValues>(key: K): void {
    this.values[key] += 1;
  }

  snapshot(): IntegrationMetricValues {
    return { ...this.values };
  }
}

export const integrationMetrics = new IntegrationMetrics();
