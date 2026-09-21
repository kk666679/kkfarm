import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, RefreshCw, Bell, Shield, Database } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { settingsService, type AppSettings } from '@/services/settings.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    siteName: 'Farms Device Farm',
    adminEmail: 'admin@farms.dev',
    maxDevices: 100,
    autoReboot: true,
    emailNotifications: true,
    slackNotifications: false,
    sessionTimeout: 30,
    maintenanceMode: false,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: serverSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.get(),
  });

  const updateMutation = useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully',
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings({
      siteName: 'Farms Device Farm',
      adminEmail: 'admin@farms.dev',
      maxDevices: 100,
      autoReboot: true,
      emailNotifications: true,
      slackNotifications: false,
      sessionTimeout: 30,
      maintenanceMode: false,
    });
    toast({
      title: 'Settings Reset',
      description: 'Settings have been reset to defaults',
    });
  };

  const currentSettings = serverSettings || settings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your device farm preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={currentSettings.siteName}
                  onChange={e => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={currentSettings.adminEmail}
                  onChange={e => setSettings({ ...settings, adminEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDevices">Max Devices</Label>
                <Input
                  id="maxDevices"
                  type="number"
                  value={currentSettings.maxDevices}
                  onChange={e => setSettings({ ...settings, maxDevices: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for critical events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={currentSettings.emailNotifications}
                  onCheckedChange={checked =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slackNotifications">Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications to Slack channel
                  </p>
                </div>
                <Switch
                  id="slackNotifications"
                  checked={currentSettings.slackNotifications}
                  onCheckedChange={checked =>
                    setSettings({ ...settings, slackNotifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={currentSettings.sessionTimeout}
                  onChange={e =>
                    setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable device operations
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={currentSettings.maintenanceMode}
                  onCheckedChange={checked =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span>v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span>Production</span>
              </div>
              <Separator />
              <div className="pt-2">
                <p className="text-muted-foreground mb-2">API Endpoints</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>REST API</span>
                    <Badge variant="outline">/api</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>WebSocket</span>
                    <Badge variant="outline">/ws</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
