import type { EmulatorProfile } from '../types';

export interface ProfileCustomization {
  name?: string;
  cpuCores?: number;
  ramMb?: number;
  storageMb?: number;
  tags?: string[];
}

export class EmulatorProfileCustomizer {
  customize(profile: EmulatorProfile, customization: ProfileCustomization): EmulatorProfile {
    const cpuCores = customization.cpuCores ?? profile.cpuCores ?? 2;
    const ramMb = customization.ramMb ?? profile.ramMb;
    const storageMb = customization.storageMb ?? profile.storageMb;
    if (cpuCores < 1 || ramMb < 1024 || storageMb < 4096)
      throw new Error('Customized profile resources are too low');
    return {
      ...profile,
      name: customization.name ?? profile.name,
      cpuCores,
      ramMb,
      storageMb,
      tags: customization.tags
        ? [...new Set([...(profile.tags ?? []), ...customization.tags])]
        : profile.tags
          ? [...profile.tags]
          : [],
    };
  }
}
