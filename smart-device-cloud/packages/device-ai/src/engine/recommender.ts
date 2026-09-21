import type { AiRecommendationInput, RecommendationAction } from '../types';

function nextId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export class RecommendationEngine {
  recommend(input: AiRecommendationInput): AiRecommendationInput['samples'] extends []
    ? never
    : Array<{
        id: string;
        deviceId?: string;
        action: RecommendationAction;
        status: 'pending';
        confidence: number;
        score: number;
        reason: string;
        description: string;
        affectedDeviceCount: number;
        evidence: Record<string, unknown>;
        createdAt: string;
      }> {
    const recommendations: Array<ReturnType<RecommendationEngine['recommend']>[number]> = [];
    for (const sample of input.samples) {
      const cpu = sample.cpuPercent ?? 0;
      const memory = sample.memoryPercent ?? 0;
      const temperature = sample.temperatureC ?? 25;
      if (cpu > 90 || memory > 90 || temperature > 75) {
        recommendations.push({
          id: nextId(),
          deviceId: sample.deviceId,
          action:
            temperature > 85 ? 'quarantine_device' : cpu > 95 ? 'reboot_device' : 'clear_cache',
          status: 'pending',
          confidence: Math.min(0.99, 0.55 + Math.max(cpu, memory, temperature - 50) / 150),
          score: Math.min(100, Math.max(cpu, memory, temperature)),
          reason: 'Resource or thermal threshold exceeded',
          description: 'Review the proposed device stabilization action before execution.',
          affectedDeviceCount: 1,
          evidence: { cpu, memory, temperature, timestamp: sample.timestamp },
          createdAt: input.now ?? new Date().toISOString(),
        });
      }
    }
    return recommendations;
  }
}
