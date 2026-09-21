import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Globe,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { useState } from 'react';

export default function PlatformReference() {
  const [activeTab, setActiveTab] = useState('devices');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const platforms = [
    {
      id: '1',
      name: 'iOS 17',
      type: 'Mobile',
      version: '17.4',
      devices: 45,
      status: 'Supported',
      lastTested: '2h ago',
    },
    {
      id: '2',
      name: 'Android 14',
      type: 'Mobile',
      version: '14.0',
      devices: 67,
      status: 'Supported',
      lastTested: '1h ago',
    },
    {
      id: '3',
      name: 'iPadOS 17',
      type: 'Tablet',
      version: '17.4',
      devices: 12,
      status: 'Supported',
      lastTested: '3h ago',
    },
    {
      id: '4',
      name: 'Android 13',
      type: 'Mobile',
      version: '13.0',
      devices: 89,
      status: 'Legacy',
      lastTested: '1d ago',
    },
    {
      id: '5',
      name: 'iOS 16',
      type: 'Mobile',
      version: '16.7',
      devices: 23,
      status: 'Legacy',
      lastTested: '2d ago',
    },
    {
      id: '6',
      name: 'Chrome OS',
      type: 'Desktop',
      version: '120',
      devices: 8,
      status: 'Beta',
      lastTested: '4h ago',
    },
    {
      id: '7',
      name: 'Windows 11',
      type: 'Desktop',
      version: '23H2',
      devices: 34,
      status: 'Supported',
      lastTested: '30m ago',
    },
    {
      id: '8',
      name: 'macOS Sonoma',
      type: 'Desktop',
      version: '14.4',
      devices: 12,
      status: 'Supported',
      lastTested: '1h ago',
    },
  ];

  const filteredPlatforms = platforms.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.version.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.type === filter || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Reference</h1>
          <p className="text-muted-foreground">Supported platforms and compatibility matrix</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Platform
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="browsers">Browsers</TabsTrigger>
          <TabsTrigger value="os">Operating Systems</TabsTrigger>
          <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search platforms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="rounded-lg border p-2 bg-background"
              >
                <option value="all">All</option>
                <option value="Mobile">Mobile</option>
                <option value="Tablet">Tablet</option>
                <option value="Desktop">Desktop</option>
                <option value="Supported">Supported</option>
                <option value="Legacy">Legacy</option>
                <option value="Beta">Beta</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPlatforms.map(platform => (
              <Card key={platform.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          platform.type === 'Mobile'
                            ? 'bg-blue-500/10'
                            : platform.type === 'Tablet'
                              ? 'bg-purple-500/10'
                              : 'bg-green-500/10'
                        }`}
                      >
                        {platform.type === 'Mobile' && (
                          <Smartphone className="h-6 w-6 text-blue-500" />
                        )}
                        {platform.type === 'Tablet' && (
                          <Tablet className="h-6 w-6 text-purple-500" />
                        )}
                        {platform.type === 'Desktop' && (
                          <Monitor className="h-6 w-6 text-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{platform.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              platform.status === 'Supported'
                                ? 'bg-green-500/10 text-green-500'
                                : platform.status === 'Legacy'
                                  ? 'bg-gray-500/10 text-gray-500'
                                  : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {platform.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Version {platform.version} • {platform.devices} devices
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {platform.devices}
                      </span>
                      <span>Last tested: {platform.lastTested}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browsers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Browser Compatibility</CardTitle>
              <CardDescription>Supported browsers and versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'Chrome',
                    versions: '120+',
                    engine: 'Blink',
                    status: 'Full Support',
                    notes: 'Recommended',
                  },
                  {
                    name: 'Firefox',
                    versions: '121+',
                    engine: 'Gecko',
                    status: 'Full Support',
                    notes: 'Recommended',
                  },
                  {
                    name: 'Safari',
                    versions: '17+',
                    engine: 'WebKit',
                    status: 'Full Support',
                    notes: 'iOS/macOS only',
                  },
                  {
                    name: 'Edge',
                    versions: '120+',
                    engine: 'Blink',
                    status: 'Full Support',
                    notes: 'Windows/macOS',
                  },
                  {
                    name: 'Samsung Internet',
                    versions: '21+',
                    engine: 'Blink',
                    status: 'Partial',
                    notes: 'Android only',
                  },
                ].map((browser, i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium">{browser.name}</span>
                            <p className="text-xs text-muted-foreground">{browser.engine} Engine</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{browser.versions}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              browser.status === 'Full Support'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {browser.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="os" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operating System Versions</CardTitle>
              <CardDescription>Tested OS versions and support status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'iOS',
                    versions: ['17.4', '17.3', '17.2', '17.1', '17.0', '16.7', '16.6', '15.8'],
                    current: '17.4',
                    deprecated: ['15.8', '16.6'],
                  },
                  {
                    name: 'Android',
                    versions: ['14', '13', '12L', '12', '11', '10'],
                    current: '14',
                    deprecated: ['10', '11'],
                  },
                  {
                    name: 'iPadOS',
                    versions: ['17.4', '17.3', '17.2', '17.1', '17.0', '16.7'],
                    current: '17.4',
                    deprecated: [],
                  },
                  {
                    name: 'Windows',
                    versions: ['11 23H2', '11 22H2', '10 22H2', '10 21H2'],
                    current: '11 23H2',
                    deprecated: ['10 21H2'],
                  },
                  {
                    name: 'macOS',
                    versions: ['14.4', '14.3', '14.2', '14.1', '14.0', '13.6'],
                    current: '14.4',
                    deprecated: ['13.6'],
                  },
                ].map((os, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Monitor className="h-5 w-5" />
                          {os.name}
                        </CardTitle>
                        <Badge variant={os.deprecated.length > 0 ? 'secondary' : 'default'}>
                          {os.deprecated.length > 0 ? 'Has Deprecated' : 'Current'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {os.versions.map(version => (
                          <Badge
                            key={version}
                            variant={
                              version === os.current
                                ? 'default'
                                : os.deprecated.includes(version)
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className={version === os.current ? 'font-medium' : ''}
                          >
                            {version} {version === os.current && '(current)'}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Compatibility Matrix</CardTitle>
              <CardDescription>Feature support across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-2 pr-4 text-left font-medium">Feature</th>
                      <th className="pb-2 pr-4 text-center font-medium">iOS</th>
                      <th className="pb-2 pr-4 text-center font-medium">Android</th>
                      <th className="pb-2 pr-4 text-center font-medium">iPadOS</th>
                      <th className="pb-2 pr-4 text-center font-medium">Windows</th>
                      <th className="pb-2 pr-4 text-center font-medium">macOS</th>
                      <th className="pb-2 pr-4 text-center font-medium">Chrome</th>
                      <th className="pb-2 pr-4 text-center font-medium">Firefox</th>
                      <th className="pb-2 pr-4 text-center font-medium">Safari</th>
                      <th className="pb-2 pr-4 text-center font-medium">Edge</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: 'Device Automation',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: true,
                        firefox: true,
                        safari: true,
                        edge: true,
                      },
                      {
                        feature: 'App Installation',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: false,
                        firefox: false,
                        safari: false,
                        edge: false,
                      },
                      {
                        feature: 'Screen Recording',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: true,
                        firefox: true,
                        safari: true,
                        edge: true,
                      },
                      {
                        feature: 'Network Interception',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: true,
                        firefox: true,
                        safari: false,
                        edge: true,
                      },
                      {
                        feature: 'Biometric Auth',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: false,
                        firefox: false,
                        safari: false,
                        edge: false,
                      },
                      {
                        feature: 'GPS Simulation',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: false,
                        macos: false,
                        chrome: false,
                        firefox: false,
                        safari: false,
                        edge: false,
                      },
                      {
                        feature: 'Push Notifications',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: true,
                        firefox: true,
                        safari: true,
                        edge: true,
                      },
                      {
                        feature: 'Background Tasks',
                        ios: true,
                        android: true,
                        ipados: true,
                        windows: true,
                        macos: true,
                        chrome: false,
                        firefox: false,
                        safari: false,
                        edge: false,
                      },
                    ].map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-3 pr-4 font-medium">{row.feature}</td>
                        {(
                          [
                            'ios',
                            'android',
                            'ipados',
                            'windows',
                            'macos',
                            'chrome',
                            'firefox',
                            'safari',
                            'edge',
                          ] as const
                        ).map(platform => (
                          <td key={platform} className="py-3 text-center">
                            {row[platform] ? (
                              <svg
                                className="h-4 w-4 text-green-500 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4 text-red-500 mx-auto"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
