export type RecommendationAction =
  | 'reboot_device'
  | 'clear_cache'
  | 'redistribute_workload'
  | 'quarantine_device'
  | 'update_agent'
  | 'replace_device';
export type RecommendationStatus =
  'pending' | 'reviewed' | 'applied' | 'ignored' | 'accepted' | 'dismissed';
export type RecommendationConfidence = number;
export interface Recommendation {
  id: string;
  deviceId?: string;
  action: RecommendationAction;
  status: RecommendationStatus;
  confidence: RecommendationConfidence;
  score: number;
  reason: string;
  description: string;
  affectedDeviceCount: number;
  clusterId: string;
  clusterType: string;
  rootCauseHypothesis: string;
  evidence?: Record<string, unknown>;
  metricTrends: MetricTrend[];
  createdAt: string;
  reviewedAt?: string;
  appliedAt?: string;
  authorizedBy?: string;
}
export interface MetricTrend {
  metricName: string;
  direction: 'up' | 'down' | 'stable';
  value: number;
  threshold?: number;
  timeframe?: string;
}
export interface ScalingRecommendation {
  deviceId: string;
  currentLoad: number;
  recommendedCapacity: number;
  costImpact: number;
  confidence: number;
  reasoning: string;
}
export interface CostOptimization {
  resourceId: string;
  currentCost: number;
  potentialSavings: number;
  recommendations: string[];
  timeframe: string;
}
//# sourceMappingURL=recommendation.d.ts.map
