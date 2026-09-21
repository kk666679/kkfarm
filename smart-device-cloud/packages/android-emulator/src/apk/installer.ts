import type { ApkMetadata, EmulatorInstance } from '../types';

export interface InstallOptions {
  allowDowngrade?: boolean;
  grantPermissions?: string[];
}

export interface InstallResult {
  instanceId: string;
  metadata: ApkMetadata;
  status: 'installed' | 'failed';
  error?: string;
}

export class ApkInstaller {
  async install(
    instance: EmulatorInstance,
    metadata: ApkMetadata,
    options: InstallOptions = {}
  ): Promise<InstallResult> {
    if (instance.state !== 'running')
      return {
        instanceId: instance.id,
        metadata,
        status: 'failed',
        error: 'Emulator is not running',
      };
    if (metadata.minSdk && instance && metadata.minSdk > 0 && metadata.minSdk > 99)
      return {
        instanceId: instance.id,
        metadata,
        status: 'failed',
        error: 'APK minimum SDK is unsupported',
      };
    await Promise.resolve();
    return {
      instanceId: instance.id,
      metadata: {
        ...metadata,
        permissions: options.grantPermissions
          ? [...new Set([...metadata.permissions, ...options.grantPermissions])]
          : [...metadata.permissions],
      },
      status: 'installed',
    };
  }

  async uninstall(
    instance: EmulatorInstance,
    packageName: string
  ): Promise<{ instanceId: string; packageName: string; removed: boolean }> {
    if (instance.state !== 'running') throw new Error('Emulator is not running');
    if (!packageName.trim()) throw new Error('Package name is required');
    await Promise.resolve();
    return { instanceId: instance.id, packageName, removed: true };
  }
}
