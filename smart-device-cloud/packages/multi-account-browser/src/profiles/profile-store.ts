import type { BrowserProfile, BrowserProfileState, BrowserProfileTemplate } from '../types';

export class BrowserProfileStore {
  private readonly profiles = new Map<string, BrowserProfile>();

  save(profile: BrowserProfile): void {
    this.profiles.set(profile.id, { ...profile });
  }

  get(id: string): BrowserProfile | undefined {
    const profile = this.profiles.get(id);
    return profile ? { ...profile } : undefined;
  }

  list(state?: BrowserProfileState): BrowserProfile[] {
    return Array.from(this.profiles.values())
      .filter(profile => !state || profile.state === state)
      .map(profile => ({ ...profile }));
  }

  delete(id: string): boolean {
    return this.profiles.delete(id);
  }
}

export class BrowserProfileTemplateEngine {
  private readonly templates = new Map<string, BrowserProfileTemplate>();

  register(template: BrowserProfileTemplate): void {
    this.templates.set(template.id, {
      ...template,
      extensions: template.extensions ? [...template.extensions] : [],
      defaultPermissions: { ...template.defaultPermissions },
    });
  }

  materialize(templateId: string, name: string, profileId: string): BrowserProfile {
    const template = this.templates.get(templateId);
    if (!template) throw new Error(`Browser profile template not found: ${templateId}`);
    const now = new Date().toISOString();
    return {
      id: profileId,
      name,
      ...(template.userAgent ? { userAgent: template.userAgent } : {}),
      ...(template.timezone ? { timezone: template.timezone } : {}),
      ...(template.locale ? { locale: template.locale } : {}),
      state: 'active',
      createdAt: now,
      updatedAt: now,
    };
  }

  list(): BrowserProfileTemplate[] {
    return Array.from(this.templates.values()).map(template => ({
      ...template,
      extensions: template.extensions ? [...template.extensions] : [],
      defaultPermissions: { ...template.defaultPermissions },
    }));
  }
}
