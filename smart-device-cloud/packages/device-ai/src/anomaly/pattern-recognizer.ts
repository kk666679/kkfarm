import type { DeviceTelemetrySample } from '../types';

export interface Pattern {
  id: string;
  deviceId: string;
  type: 'resource_saturation' | 'thermal_drift' | 'network_degradation' | 'heartbeat_loss';
  confidence: number;
  evidence: string[];
}

export class PatternRecognizer {
  recognize(samples: readonly DeviceTelemetrySample[]): Pattern[] {
    const patterns: Pattern[] = [];
    for (const sample of samples) {
      const evidence: string[] = [];
      if ((sample.cpuPercent ?? 0) > 85 && (sample.memoryPercent ?? 0) > 85)
        evidence.push('cpu_and_memory');
      if ((sample.temperatureC ?? 0) > 65) evidence.push('temperature_trend');
      if ((sample.networkLatencyMs ?? 0) > 200) evidence.push('network_latency');
      if ((sample.heartbeatAgeMs ?? 0) > 20000) evidence.push('heartbeat_delay');
      if (evidence.length > 0)
        patterns.push({
          id: `pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          deviceId: sample.deviceId,
          type: evidence.includes('temperature_trend')
            ? 'thermal_drift'
            : evidence.includes('network_latency')
              ? 'network_degradation'
              : evidence.includes('heartbeat_delay')
                ? 'heartbeat_loss'
                : 'resource_saturation',
          confidence: Math.min(0.99, 0.5 + evidence.length * 0.12),
          evidence,
        });
    }
    return patterns;
  }
}
