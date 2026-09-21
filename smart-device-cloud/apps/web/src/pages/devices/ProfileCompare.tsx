import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

interface Setting {
  key: string;
  profile1: string;
  profile2: string;
  match: boolean;
}

export default function ProfileCompare() {
  const [profile1, setProfile1] = useState('default');
  const [profile2, setProfile2] = useState('testing');

  const profiles = ['default', 'testing', 'production', 'development'];

  const settings: Setting[] = [
    { key: 'screen_brightness', profile1: '80', profile2: '100', match: false },
    { key: 'wifi_enabled', profile1: 'true', profile2: 'true', match: true },
    { key: 'bluetooth_enabled', profile1: 'true', profile2: 'false', match: false },
    { key: 'airplane_mode', profile1: 'false', profile2: 'false', match: true },
    { key: 'location_enabled', profile1: 'true', profile2: 'true', match: true },
    { key: 'developer_mode', profile1: 'false', profile2: 'true', match: false },
  ];

  const matchPercentage = (settings.filter(s => s.match).length / settings.length) * 100;

  return (
    <PageContainer>
      <PageHeader
        title="Profile Comparison"
        description="Compare device configuration profiles"
        breadcrumbs={[{ label: 'Devices' }, { label: 'Profiles' }, { label: 'Compare' }]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Profiles to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Profile 1</label>
              <Select value={profile1} onValueChange={value => setProfile1(value ?? 'default')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Profile 2</label>
              <Select value={profile2} onValueChange={value => setProfile2(value ?? 'testing')}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(p => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Card className="w-full">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {matchPercentage.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Match</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Differences</CardTitle>
          <CardDescription>
            Comparing {profile1.charAt(0).toUpperCase() + profile1.slice(1)} with{' '}
            {profile2.charAt(0).toUpperCase() + profile2.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Setting</th>
                  <th className="text-left py-3 px-4 font-semibold">
                    {profile1.charAt(0).toUpperCase() + profile1.slice(1)}
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">
                    {profile2.charAt(0).toUpperCase() + profile2.slice(1)}
                  </th>
                  <th className="text-center py-3 px-4 font-semibold">Match</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((setting, index) => (
                  <tr key={index} className={`border-b ${!setting.match ? 'bg-red-50' : ''}`}>
                    <td className="py-3 px-4 font-medium">{setting.key}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{setting.profile1}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{setting.profile2}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {setting.match ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
