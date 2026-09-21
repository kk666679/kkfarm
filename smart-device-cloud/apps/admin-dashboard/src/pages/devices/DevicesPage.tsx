import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService, type Device } from '@/services/api';
import { Search, Plus, Edit2, Trash2, Power, PowerOff } from 'lucide-react';

export default function DevicesPage() {
  const [search, setSearch] = useState('');
  const { data: devices, isLoading } = useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => cloudService.getDevices(),
    refetchInterval: 30000,
  });

  const filtered = devices?.filter(
    (d: Device) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.platform.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageTitle title="Devices" subtitle="Monitor and manage your device fleet" />

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search devices..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Register Device
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No devices found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Platform</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Battery</th>
                  <th className="pb-3">CPU</th>
                  <th className="pb-3">Last Seen</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((device: Device) => (
                  <DeviceRow key={device.id} device={device} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeviceRow({ device }: { device: Device }) {
  const statusColor: Record<string, string> = {
    online: 'text-green-400',
    ready: 'text-blue-400',
    degraded: 'text-yellow-400',
    offline: 'text-slate-400',
    maintenance: 'text-orange-400',
    quarantined: 'text-red-400',
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
      <td className="py-3 font-medium">{device.name}</td>
      <td
        className={`py-3 capitalize ${statusColor[device.status?.toLowerCase()] ?? 'text-slate-400'}`}
      >
        {device.status}
      </td>
      <td className="py-3 text-slate-400">{device.platform}</td>
      <td className="py-3 text-slate-400">{device.model ?? '-'}</td>
      <td className="py-3">{device.batteryLevel}%</td>
      <td className="py-3">{device.cpuUsage ?? '-'}%</td>
      <td className="py-3 text-slate-400">{device.lastSeen}</td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Power className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
