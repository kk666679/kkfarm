import type { AiRecommendationInput, AiRecommendation } from '../types';
import { TelemetryAnalyzer } from './analyzer';
import { RecommendationEngine } from './recommender';

export class DeviceAiEngineCore {
  private readonly analyzer = new TelemetryAnalyzer();
  private readonly recommender = new RecommendationEngine();

  analyze(input: AiRecommendationInput): Array<
    Omit<
      AiRecommendation,
      | 'id'
      | 'status'
      | 'confidence'
      | 'score'
      | 'reason'
      | 'description'
      | 'affectedDeviceCount'
      | 'evidence'
      | 'createdAt'
    > & {
      id: string;
      status: 'pending';
      confidence: number;
      score: number;
      reason: string;
      description: string;
      affectedDeviceCount: number;
      evidence: Record<string, unknown>;
      createdAt: string;
    }
  > {
    const analysis = this.analyzer.analyze(input.samples, input.workloads);
    const recommendations = this.recommender.recommend(input);
    return recommendations.map(recommendation => ({
      ...recommendation,
      evidence: { ...recommendation.evidence, analysis },
    }));
  }
}
