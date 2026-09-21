import { buildApiUrl } from '@/lib/api';

export interface AppSettings {
  siteName: string;
  adminEmail: string;
  maxDevices: number;
  autoReboot: boolean;
  emailNotifications: boolean;
  slackNotifications: boolean;
  sessionTimeout: number;
  maintenanceMode: boolean;
}

export const defaultSettings: AppSettings = {
  siteName: 'Farms Device Farm',
  adminEmail: 'admin@farms.dev',
  maxDevices: 100,
  autoReboot: true,
  emailNotifications: true,
  slackNotifications: false,
  sessionTimeout: 30,
  maintenanceMode: false,
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    const res = await fetch(buildApiUrl('/admin/users'));
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async update(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(buildApiUrl('/admin/users'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },
};
