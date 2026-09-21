import type { AiRecommendationInput } from '../types';
import { DeviceAiEngineCore } from '../engine/engine';

export class DeviceAiEvalHarness {
  constructor(private readonly engine = new DeviceAiEngineCore()) {}

  run(input: AiRecommendationInput): {
    recommendationCount: number;
    highConfidenceCount: number;
    anomalyCount: number;
  } {
    const recommendations = this.engine.analyze(input);
    return {
      recommendationCount: recommendations.length,
      highConfidenceCount: recommendations.filter(item => item.confidence >= 0.8).length,
      anomalyCount: input.samples.length,
    };
  }
}

export class DeviceAiScorers {
  precision(recommendations: readonly { relevant: boolean }[]): number {
    const relevant = recommendations.filter(item => item.relevant).length;
    return recommendations.length === 0 ? 0 : relevant / recommendations.length;
  }
}
