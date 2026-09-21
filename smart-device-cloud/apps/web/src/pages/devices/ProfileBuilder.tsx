import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save } from 'lucide-react';

interface ProfileSetting {
  key: string;
  value: string;
  description: string;
}

export default function ProfileBuilder() {
  const [profileName, setProfileName] = useState('Default Profile');
  const [settings, setSettings] = useState<ProfileSetting[]>([
    {
      key: 'screen_brightness',
      value: '80',
      description: 'Screen brightness percentage',
    },
    {
      key: 'wifi_enabled',
      value: 'true',
      description: 'WiFi enabled/disabled',
    },
    {
      key: 'bluetooth_enabled',
      value: 'true',
      description: 'Bluetooth enabled/disabled',
    },
  ]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAddSetting = () => {
    if (newKey && newValue) {
      setSettings([
        ...settings,
        {
          key: newKey,
          value: newValue,
          description: '',
        },
      ]);
      setNewKey('');
      setNewValue('');
    }
  };

  const handleRemoveSetting = (index: number) => {
    setSettings(settings.filter((_, i) => i !== index));
  };

  const handleUpdateSetting = (index: number, value: string) => {
    const updated = [...settings];
    updated[index].value = value;
    setSettings(updated);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Device Profile Builder"
        description="Create and manage device configuration profiles"
        breadcrumbs={[{ label: 'Devices' }, { label: 'Profiles' }]}
        actions={[
          { label: 'Save Profile', onClick: () => {} },
          { label: 'Export', onClick: () => {} },
        ]}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Saved Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Default', 'Testing', 'Production', 'Development'].map(profile => (
                <Button
                  key={profile}
                  variant={profile === 'Default' ? 'default' : 'outline'}
                  className="w-full justify-start"
                >
                  {profile}
                </Button>
              ))}
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Configure device settings for this profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="settings" className="w-full">
                <TabsList>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="apps">Apps</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {settings.map((setting, index) => (
                      <div key={index} className="flex items-end gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">{setting.key}</Label>
                          <Input
                            value={setting.value}
                            onChange={e => handleUpdateSetting(index, e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveSetting(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border border-dashed rounded-lg">
                    <Label className="text-sm font-semibold mb-3 block">Add New Setting</Label>
                    <div className="space-y-3">
                      <Input
                        placeholder="Setting key"
                        value={newKey}
                        onChange={e => setNewKey(e.target.value)}
                      />
                      <Input
                        placeholder="Setting value"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                      />
                      <Button onClick={handleAddSetting} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Setting
                      </Button>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </Button>
                </TabsContent>

                <TabsContent value="apps" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    App installation settings
                  </div>
                </TabsContent>

                <TabsContent value="permissions" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Permission configuration
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
