export interface EmulatorMetricValues {
  instancesStarted: number;
  instancesStopped: number;
  adbCommands: number;
  testsRun: number;
  alerts: number;
}

export class EmulatorMetrics {
  private values: EmulatorMetricValues = {
    instancesStarted: 0,
    instancesStopped: 0,
    adbCommands: 0,
    testsRun: 0,
    alerts: 0,
  };

  increment<K extends keyof EmulatorMetricValues>(key: K, amount = 1): void {
    this.values[key] = (this.values[key] + amount) as EmulatorMetricValues[K];
  }

  snapshot(): EmulatorMetricValues {
    return { ...this.values };
  }
}

export const emulatorMetrics = new EmulatorMetrics();
