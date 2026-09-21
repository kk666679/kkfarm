import { all, run, get } from '../db/database.ts';
import type { Application, AppHealthStatus, InstallStatus } from '@smart-device-cloud/shared';

export class ApplicationService {
  async getAll(): Promise<Application[]> {
    const rows = await all<any>('SELECT * FROM applications ORDER BY updated_at DESC');
    return rows.map(this.mapRow);
  }

  async getById(id: string): Promise<Application | null> {
    const row = await get<any>('SELECT * FROM applications WHERE id = $1', [id]);
    return row ? this.mapRow(row) : null;
  }

  async create(data: Partial<Application>): Promise<Application> {
    const now = new Date().toISOString();
    const app: Application = {
      id: data.id ?? `app-${Date.now()}`,
      packageName: data.packageName ?? '',
      versionName: data.versionName ?? '1.0.0',
      versionCode: data.versionCode ?? 1,
      installStatus: 'pending',
      healthStatus: 'unknown',
      updatedAt: now,
      installedDeviceCount: 0,
      healthyDeviceCount: 0,
      failedDeviceCount: 0,
    };

    await run(
      `INSERT INTO applications (id, package_name, version_name, version_code, install_status, health_status, updated_at, installed_device_count, healthy_device_count, failed_device_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        app.id,
        app.packageName,
        app.versionName,
        app.versionCode,
        app.installStatus,
        app.healthStatus,
        app.updatedAt,
        app.installedDeviceCount,
        app.healthyDeviceCount,
        app.failedDeviceCount,
      ]
    );

    return app;
  }

  async updateStatus(
    id: string,
    updates: Partial<
      Pick<
        Application,
        | 'installStatus'
        | 'healthStatus'
        | 'installedDeviceCount'
        | 'healthyDeviceCount'
        | 'failedDeviceCount'
      >
    >
  ): Promise<void> {
    const now = new Date().toISOString();
    const sets: string[] = ['updated_at = ?'];
    const params: any[] = [now];

    if (updates.installStatus !== undefined) {
      sets.push('install_status = ?');
      params.push(updates.installStatus);
    }
    if (updates.healthStatus !== undefined) {
      sets.push('health_status = ?');
      params.push(updates.healthStatus);
    }
    if (updates.installedDeviceCount !== undefined) {
      sets.push('installed_device_count = ?');
      params.push(updates.installedDeviceCount);
    }
    if (updates.healthyDeviceCount !== undefined) {
      sets.push('healthy_device_count = ?');
      params.push(updates.healthyDeviceCount);
    }
    if (updates.failedDeviceCount !== undefined) {
      sets.push('failed_device_count = ?');
      params.push(updates.failedDeviceCount);
    }

    params.push(id);
    await run(`UPDATE applications SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }

  private mapRow(row: any): Application {
    return {
      id: row.id,
      packageName: row.package_name,
      versionName: row.version_name,
      versionCode: row.version_code,
      minSdk: row.min_sdk,
      targetSdk: row.target_sdk,
      installStatus: row.install_status as InstallStatus,
      healthStatus: row.health_status as AppHealthStatus,
      apkUrl: row.apk_url,
      apkHash: row.apk_hash,
      sizeBytes: row.size_bytes,
      installedAt: row.installed_at,
      updatedAt: row.updated_at,
      permissions: JSON.parse(row.permissions ?? '[]'),
      installedDeviceCount: row.installed_device_count,
      healthyDeviceCount: row.healthy_device_count,
      failedDeviceCount: row.failed_device_count,
      previousVersionName: row.previous_version_name,
      previousVersionCode: row.previous_version_code,
      lastDeployedAt: row.last_deployed_at,
    };
  }
}

export const applicationService = new ApplicationService();
