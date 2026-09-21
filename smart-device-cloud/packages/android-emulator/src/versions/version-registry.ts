import type { EmulatorImage, EmulatorImageStatus } from '../types';

export class AndroidVersionRegistry {
  private readonly versions = new Map<string, EmulatorImage>();

  register(image: EmulatorImage): void {
    if (image.apiLevel < 29) throw new Error('Android API level must be at least 29');
    this.versions.set(image.id, { ...image });
  }

  find(
    version: string,
    apiLevel?: number,
    architecture: 'x86_64' | 'arm64' = 'x86_64'
  ): EmulatorImage | undefined {
    return Array.from(this.versions.values()).find(
      image =>
        image.androidVersion === version &&
        image.status === 'available' &&
        image.architecture === architecture &&
        (!apiLevel || image.apiLevel === apiLevel)
    );
  }

  list(status?: EmulatorImageStatus): EmulatorImage[] {
    return Array.from(this.versions.values()).filter(image => !status || image.status === status);
  }
}

export const DEFAULT_ANDROID_VERSIONS = ['10', '11', '12', '13', '14', '15'] as const;
