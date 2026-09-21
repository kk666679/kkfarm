import type { Anomaly } from '../types';

export class AlertGenerator {
  generate(anomalies: readonly Anomaly[]): Array<
    Omit<Anomaly, 'value' | 'threshold' | 'detectedAt'> & {
      id: string;
      deviceId: string;
      severity: Anomaly['severity'];
      type: string;
      description: string;
      createdAt: string;
    }
  > {
    return anomalies.map(anomaly => ({
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      deviceId: anomaly.deviceId,
      severity: anomaly.severity,
      type: anomaly.type,
      description: anomaly.description,
      createdAt: new Date().toISOString(),
    }));
  }
}
