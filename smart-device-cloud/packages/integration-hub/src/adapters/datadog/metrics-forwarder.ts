import type { IntegrationConfig } from '../../types';
import { DatadogClient } from './client';

export class DatadogMetricsForwarder extends DatadogClient {
  async forward(
    config: IntegrationConfig,
    series: Array<{ metric: string; value: number; timestamp: string }>
  ): Promise<boolean> {
    return series.length > 0 && (await this.test(config));
  }
}
