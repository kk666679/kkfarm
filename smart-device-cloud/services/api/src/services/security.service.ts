import { all, run } from '../db/database.ts';
import type { Device } from '@smart-device-cloud/shared';

export class SecurityService {
  async checkCompliance(device: Device): Promise<{ isCompliant: boolean; failedChecks: string[] }> {
    const failedChecks: string[] = [];
    const androidVersion = Number.parseInt(device.androidVersion ?? '0', 10);

    if (Number.isFinite(androidVersion) && androidVersion < 10) {
      failedChecks.push('Android version below 10');
    }

    const patchDate = device.securityPatchDate ? new Date(device.securityPatchDate) : new Date(0);
    const daysSincePatch = (Date.now() - patchDate.getTime()) / (1000 * 60 * 60 * 24);
    if (Number.isFinite(daysSincePatch) && daysSincePatch > 90) {
      failedChecks.push('Security patch older than 90 days');
    }

    const isCompliant = failedChecks.length === 0;
    return { isCompliant, failedChecks };
  }

  async getComplianceStats(): Promise<{
    total: number;
    compliant: number;
    nonCompliant: number;
    byCheck: Record<string, { passed: number; failed: number }>;
  }> {
    const devices = await all<Device>('SELECT * FROM devices');
    let compliant = 0;
    const byCheck: Record<string, { passed: number; failed: number }> = {};

    for (const device of devices) {
      const result = await this.checkCompliance(device);
      if (result.isCompliant) {
        compliant++;
      }
      for (const check of result.failedChecks) {
        byCheck[check] = byCheck[check] || { passed: 0, failed: 0 };
        byCheck[check].failed++;
      }
    }

    return {
      total: devices.length,
      compliant,
      nonCompliant: devices.length - compliant,
      byCheck,
    };
  }
}

export const securityService = new SecurityService();
