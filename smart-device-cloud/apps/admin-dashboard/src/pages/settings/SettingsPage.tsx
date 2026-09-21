import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import {
  Save,
  RotateCcw,
  Bell,
  Shield,
  Monitor,
  Clock,
  Languages,
  Globe,
  Lock,
  Mail,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    data: settings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'settings'],
    queryFn: () => cloudService.getSettings(),
  });

  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings) {
      setForm({
        applicationName: settings.applicationName,
        region: settings.region,
        language: settings.language,
        ...settings.notifications,
        ...settings.security,
        ...settings.display,
      });
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Settings"
          subtitle="Configure dashboard preferences and system settings"
        />
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading settings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Settings"
          subtitle="Configure dashboard preferences and system settings"
        />
        <div className="text-center py-12 text-red-400">
          Failed to load settings: {(error as Error).message}
        </div>
      </div>
    );
  }

  const updateField = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await cloudService.updateSettings(form);
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" subtitle="Configure dashboard preferences and system settings" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsSection title="General" icon={Globe}>
          <SettingField
            label="Application Name"
            value={form.applicationName}
            onChange={v => updateField('applicationName', v)}
          />
          <SettingField
            label="Default Region"
            value={form.region}
            onChange={v => updateField('region', v)}
          />
          <SettingField
            label="Language"
            value={form.language}
            onChange={v => updateField('language', v)}
          />
        </SettingsSection>

        <SettingsSection title="Notifications" icon={Bell}>
          <SettingToggle
            label="Email Notifications"
            checked={form.emailNotifications ?? false}
            onChange={v => updateField('emailNotifications', v)}
          />
          <SettingToggle
            label="In-App Notifications"
            checked={form.inAppNotifications ?? false}
            onChange={v => updateField('inAppNotifications', v)}
          />
          <SettingToggle
            label="Webhook Alerts"
            checked={form.webhookAlerts ?? false}
            onChange={v => updateField('webhookAlerts', v)}
          />
          <SettingToggle
            label="Digest Emails"
            checked={form.digestEmails ?? false}
            onChange={v => updateField('digestEmails', v)}
          />
        </SettingsSection>

        <SettingsSection title="Security" icon={Shield}>
          <SettingToggle
            label="Two-Factor Authentication"
            checked={form.twoFactorAuth ?? false}
            onChange={v => updateField('twoFactorAuth', v)}
          />
          <SettingField
            label="Session Timeout"
            value={form.sessionTimeout}
            onChange={v => updateField('sessionTimeout', v)}
          />
          <SettingToggle
            label="IP Whitelisting"
            checked={form.ipWhitelisting ?? false}
            onChange={v => updateField('ipWhitelisting', v)}
          />
          <SettingField
            label="API Key Rotation"
            value={form.apiKeyRotation}
            onChange={v => updateField('apiKeyRotation', v)}
          />
        </SettingsSection>

        <SettingsSection title="Privacy" icon={Lock}>
          <SettingToggle
            label="Analytics Tracking"
            checked={form.analyticsTracking ?? false}
            onChange={v => updateField('analyticsTracking', v)}
          />
          <SettingField
            label="Usage Reporting"
            value={form.usageReporting}
            onChange={v => updateField('usageReporting', v)}
          />
          <SettingField
            label="Data Retention"
            value={form.dataRetention}
            onChange={v => updateField('dataRetention', v)}
          />
          <SettingToggle
            label="Cookie Consent"
            checked={form.cookieConsent ?? false}
            onChange={v => updateField('cookieConsent', v)}
          />
        </SettingsSection>

        <SettingsSection title="Display" icon={Monitor}>
          <SettingField
            label="Font Size"
            value={form.fontSize}
            onChange={v => updateField('fontSize', v)}
          />
          <SettingField
            label="Refresh Interval"
            value={form.refreshInterval}
            onChange={v => updateField('refreshInterval', v)}
          />
          <SettingToggle
            label="Compact View"
            checked={form.compactView ?? false}
            onChange={v => updateField('compactView', v)}
          />
          <SettingToggle
            label="Animations"
            checked={form.animations ?? false}
            onChange={v => updateField('animations', v)}
          />
        </SettingsSection>

        <SettingsSection title="Integrations" icon={Mail}>
          <SettingField
            label="Support Email"
            value={form.supportEmail}
            onChange={v => updateField('supportEmail', v)}
          />
          <SettingField
            label="Admin Email"
            value={form.adminEmail}
            onChange={v => updateField('adminEmail', v)}
          />
          <SettingField
            label="Timezone"
            value={form.timezone}
            onChange={v => updateField('timezone', v)}
          />
          <SettingField
            label="Date Format"
            value={form.dateFormat}
            onChange={v => updateField('dateFormat', v)}
          />
        </SettingsSection>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="outline" onClick={() => refetch()}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-400" />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function SettingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1">{label}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-slate-300">{label}</label>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-4' : ''}`}
        />
      </button>
    </div>
  );
}
