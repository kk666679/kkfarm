export interface AnalyticsRecord {
  id: string;
  metricName: string;
  value: number;
  tags: Record<string, string>;
  timestamp: string;
  deviceId?: string;
}

export interface AggregatedMetric {
  metricName: string;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  value: number;
  period: string;
  tags: Record<string, string>;
}

export type { Pool, PoolConfig } from 'pg';
