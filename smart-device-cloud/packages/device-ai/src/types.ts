export type AiModelTier = 'small' | 'medium' | 'large' | 'custom';
export type RecommendationAction =
  | 'reboot_device'
  | 'clear_cache'
  | 'redistribute_workload'
  | 'quarantine_device'
  | 'update_agent'
  | 'replace_device';
export type RecommendationStatus =
  'pending' | 'reviewed' | 'applied' | 'ignored' | 'accepted' | 'dismissed';
export type AnomalySeverity = 'info' | 'warning' | 'critical';

export interface DeviceTelemetrySample {
  deviceId: string;
  timestamp: string;
  cpuPercent?: number;
  memoryPercent?: number;
  storagePercent?: number;
  batteryPercent?: number;
  temperatureC?: number;
  networkLatencyMs?: number;
  heartbeatAgeMs?: number;
}

export interface WorkloadSnapshot {
  workloadId: string;
  deviceId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progressPercent: number;
  resourceUsage: { cpuPercent: number; memoryPercent: number; storagePercent: number };
}

export interface AiRecommendationInput {
  samples: DeviceTelemetrySample[];
  workloads: WorkloadSnapshot[];
  now?: string;
}

export interface AiRecommendation {
  id: string;
  deviceId?: string;
  action: RecommendationAction;
  status: RecommendationStatus;
  confidence: number;
  score: number;
  reason: string;
  description: string;
  affectedDeviceCount: number;
  evidence: Record<string, unknown>;
  createdAt: string;
  reviewedAt?: string;
  appliedAt?: string;
  authorizedBy?: string;
}

export interface Anomaly {
  id: string;
  deviceId: string;
  severity: AnomalySeverity;
  type: string;
  value: number;
  threshold: number;
  detectedAt: string;
  description: string;
}

export interface ModelRoute {
  tier: AiModelTier;
  maxContextTokens: number;
  maxOutputTokens: number;
  costPerToken: number;
  latencyBudgetMs: number;
}

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface AssistantTurn {
  messages: AssistantMessage[];
  modelTier: AiModelTier;
  response: string;
  confidence: number;
}

export interface ScalingDecision {
  deviceId: string;
  currentLoad: number;
  recommendedCapacity: number;
  costImpact: number;
  confidence: number;
  reasoning: string;
}

export interface CostOptimizationResult {
  resourceId: string;
  currentCost: number;
  potentialSavings: number;
  recommendations: string[];
  timeframe: string;
}

export interface ReviewDecision {
  recommendationId: string;
  decision: 'approve' | 'reject' | 'request_changes';
  reviewerId: string;
  reason?: string;
  reviewedAt: string;
}
