import type { EmulatorProfile } from '../types';

export interface ProfileFilter {
  apiLevel?: number;
  androidVersion?: string;
  category?: string;
  tag?: string;
}

export class EmulatorProfileCatalog {
  private readonly profiles = new Map<string, EmulatorProfile>();

  add(profile: EmulatorProfile): void {
    if (!profile.id.trim()) throw new Error('Profile ID is required');
    if (profile.apiLevel < 29 || profile.ramMb <= 0 || profile.storageMb <= 0)
      throw new Error('Invalid emulator profile');
    this.profiles.set(profile.id, { ...profile, tags: profile.tags ? [...profile.tags] : [] });
  }

  get(id: string): EmulatorProfile | undefined {
    const profile = this.profiles.get(id);
    return profile ? { ...profile, tags: profile.tags ? [...profile.tags] : [] } : undefined;
  }

  list(filter: ProfileFilter = {}): EmulatorProfile[] {
    return Array.from(this.profiles.values())
      .filter(
        profile =>
          (!filter.apiLevel || profile.apiLevel === filter.apiLevel) &&
          (!filter.androidVersion || profile.androidVersion === filter.androidVersion) &&
          (!filter.category || profile.category === filter.category) &&
          (!filter.tag || profile.tags?.includes(filter.tag))
      )
      .map(profile => ({ ...profile, tags: profile.tags ? [...profile.tags] : [] }));
  }

  remove(id: string): boolean {
    return this.profiles.delete(id);
  }
}
