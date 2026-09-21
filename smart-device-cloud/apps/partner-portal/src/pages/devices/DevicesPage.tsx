import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { usePartnerApi, usePartnerTenants } from '@/hooks/usePartnerApi';
import { PartnerSdkClient } from '@/sdk/client';
import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Power,
  Search,
  PowerOff,
  Activity,
  TrendingUp,
  Users,
  Server,
} from 'lucide-react';

export default function DevicesPage() {
  const { data: tenants, isLoading } = usePartnerTenants();
  const [search, setSearch] = useState('');
  const client = usePartnerApi();

  return (
    <div className="space-y-6">
      <PageTitle title="Devices" subtitle="Partner-accessible device inventory" />

      <div className="flex items-center gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">31</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3">Device ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Platform</th>
                <th className="pb-3">Tenant</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <DeviceRow
                id="DEV-001"
                name="Pixel 7 Pro"
                status="Online"
                platform="Android 14"
                tenant="Acme Corp"
              />
              <DeviceRow
                id="DEV-002"
                name="Samsung S24"
                status="Online"
                platform="Android 14"
                tenant="TechFlow"
              />
              <DeviceRow
                id="DEV-003"
                name="Pixel 8"
                status="Degraded"
                platform="Android 14"
                tenant="Acme Corp"
              />
              <DeviceRow
                id="DEV-004"
                name="iPhone 15"
                status="Offline"
                platform="iOS 17"
                tenant="DataDriven"
              />
              <DeviceRow
                id="DEV-005"
                name="OnePlus 12"
                status="Online"
                platform="Android 14"
                tenant="InnoSys"
              />
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function DeviceRow({
  id,
  name,
  status,
  platform,
  tenant,
}: {
  id: string;
  name: string;
  status: string;
  platform: string;
  tenant: string;
}) {
  const statusColor: Record<string, string> = {
    Online: 'text-green-400',
    Ready: 'text-blue-400',
    Degraded: 'text-yellow-400',
    Offline: 'text-slate-400',
    Maintenance: 'text-orange-400',
    Quarantined: 'text-red-400',
  };

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
      <td className="py-3 font-mono text-xs text-slate-400">{id}</td>
      <td className="py-3 font-medium">{name}</td>
      <td className={`py-3 ${statusColor[status] ?? 'text-slate-400'}`}>{status}</td>
      <td className="py-3 text-slate-400">{platform}</td>
      <td className="py-3 text-slate-400">{tenant}</td>
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
