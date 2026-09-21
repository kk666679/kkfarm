import { all, run } from '../db/database.ts';
import type { Recommendation } from '@smart-device-cloud/shared';

export class IntelligenceService {
  async getRecommendations(limit = 10): Promise<Recommendation[]> {
    const rows = await all<any>(`SELECT * FROM recommendations ORDER BY created_at DESC LIMIT $1`, [
      limit,
    ]);
    return rows.map(this.mapRow);
  }

  async updateStatus(id: string, status: Recommendation['status']): Promise<void> {
    await run(`UPDATE recommendations SET status = $1 WHERE id = $2`, [status, id]);
  }

  async generateRecommendations(): Promise<Recommendation[]> {
    const devices = await all<any>('SELECT * FROM devices WHERE state = $1 OR state = $2', [
      'degraded',
      'offline',
    ]);
    const recommendations: Recommendation[] = [];

    for (const device of devices) {
      const recommendation: Recommendation = {
        id: `rec-${Date.now()}-${device.id}`,
        description: `Device ${device.name} is in ${device.state} state. Consider investigating.`,
        affectedDeviceCount: 1,
        clusterId: device.region ?? 'unknown',
        clusterType: 'region',
        action: 'reboot_device',
        confidence: 0.7,
        score: 0.7,
        reason: `Device in ${device.state} state`,
        metricTrends: [],
        rootCauseHypothesis: 'Heartbeat delay or resource exhaustion',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await run(
        `INSERT INTO recommendations (id, description, affected_device_count, cluster_id, cluster_type, action, confidence, metric_trends, root_cause_hypothesis, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          recommendation.id,
          recommendation.description,
          recommendation.affectedDeviceCount,
          recommendation.clusterId,
          recommendation.clusterType,
          recommendation.action,
          recommendation.confidence,
          JSON.stringify(recommendation.metricTrends),
          recommendation.rootCauseHypothesis,
          recommendation.status,
          recommendation.createdAt,
        ]
      );

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  private mapRow(row: any): Recommendation {
    return {
      id: row.id,
      description: row.description,
      affectedDeviceCount: row.affected_device_count,
      clusterId: row.cluster_id,
      clusterType: row.cluster_type,
      action: row.action,
      confidence: row.confidence,
      score: row.confidence,
      reason: row.root_cause_hypothesis,
      metricTrends: JSON.parse(row.metric_trends ?? '[]'),
      rootCauseHypothesis: row.root_cause_hypothesis,
      status: row.status,
      createdAt: row.created_at,
    };
  }
}

export const intelligenceService = new IntelligenceService();
