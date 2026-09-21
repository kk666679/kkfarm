import { all, run } from '../db/database.ts';
import type { CostSummary, CostRecord, CostCategory } from '@smart-device-cloud/shared';

export class CostService {
  async getSummary(): Promise<CostSummary> {
    const devices = await all<any>('SELECT * FROM devices');
    const totalDevices = devices.length;
    const activeDeviceHours = totalDevices * 24;
    const computeCost = activeDeviceHours * 0.35;
    const storageCost = totalDevices * 10 * 0.08;
    const networkCost = totalDevices * 5 * 0.12;
    const automationCost = activeDeviceHours * 0.02;
    const totalCost = computeCost + storageCost + networkCost + automationCost;

    return {
      total: totalCost,
      byCategory: {
        compute: computeCost,
        storage: storageCost,
        network: networkCost,
        automation: automationCost,
        license: 0,
        data: 0,
      },
      byRegion: {},
      period: 'monthly',
      exceeded: false,
      costPerDevice: totalDevices > 0 ? totalCost / totalDevices : 0,
      previousPeriodCost: totalCost * 0.9,
      changePercent: 10,
    };
  }

  async getHistory(range: string): Promise<CostRecord[]> {
    const rows = await all<any>(
      `SELECT * FROM cost_records WHERE recorded_at > NOW() - INTERVAL $1 ORDER BY recorded_at DESC`,
      [`${range}`]
    );
    return rows.map(r => ({
      id: r.id,
      resourceId: r.resource_id,
      resourceType: r.resource_type,
      amount: r.amount,
      currency: r.currency,
      period: r.period,
      category: r.category as CostCategory,
      timestamp: r.recorded_at,
      region: r.region,
      unit: r.unit,
      quantity: r.quantity,
      rate: r.rate,
      recordedAt: r.recorded_at,
    }));
  }

  async recordCost(data: Omit<CostRecord, 'id' | 'recordedAt'>): Promise<void> {
    await run(
      `INSERT INTO cost_records (category, region, amount, unit, quantity, rate, recorded_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.category,
        data.region,
        data.amount,
        data.unit,
        data.quantity,
        data.rate,
        new Date().toISOString(),
      ]
    );
  }
}

export const costService = new CostService();
