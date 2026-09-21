export type InstallStatus =
  'pending' | 'downloading' | 'installing' | 'installed' | 'failed' | 'removed';
export type AppHealthStatus = 'healthy' | 'unhealthy' | 'unknown' | 'degraded';

export interface Application {
  id: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk?: number;
  targetSdk?: number;
  installStatus: InstallStatus;
  apkUrl?: string;
  apkHash?: string;
  sizeBytes?: number;
  installedAt?: string;
  updatedAt: string;
  permissions?: string[];
  healthStatus?: AppHealthStatus;
  installedDeviceCount: number;
  healthyDeviceCount: number;
  failedDeviceCount: number;
  previousVersionName?: string;
  previousVersionCode?: number;
  lastDeployedAt?: string;
  updateStatus?: string;
}
