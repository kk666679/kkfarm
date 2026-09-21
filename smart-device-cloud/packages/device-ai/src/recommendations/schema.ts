import type { AiRecommendation } from '../types';

export interface RecommendationSchema {
  id: string;
  deviceId?: string;
  action: string;
  status: string;
  confidence: number;
  score: number;
  reason: string;
  description: string;
  affectedDeviceCount: number;
  createdAt: string;
}

export function toRecommendationSchema(recommendation: AiRecommendation): RecommendationSchema {
  return {
    id: recommendation.id,
    ...(recommendation.deviceId === undefined ? {} : { deviceId: recommendation.deviceId }),
    action: recommendation.action,
    status: recommendation.status,
    confidence: recommendation.confidence,
    score: recommendation.score,
    reason: recommendation.reason,
    description: recommendation.description,
    affectedDeviceCount: recommendation.affectedDeviceCount,
    createdAt: recommendation.createdAt,
  };
}
