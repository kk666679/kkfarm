import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import { Users, Shield, Building2, Loader2 } from 'lucide-react';

export default function TenantsPage() {
  const {
    data: tenants,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', 'tenants'],
    queryFn: () => cloudService.getTenants(),
  });

  const { data: devices } = useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => cloudService.getDevices(),
  });

  const total = tenants?.length ?? 0;
  const active = tenants?.filter(t => t.status === 'Active').length ?? 0;
  const suspended = tenants?.filter(t => t.status === 'Suspended').length ?? 0;

  return (
    <div className="space-y-6">
      <PageTitle title="Tenants" subtitle="Manage tenant accounts and their fleet access" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspended}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Devices Registered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading tenants...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">
              Failed to load tenants: {(error as Error).message}
            </div>
          ) : tenants && tenants.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Devices</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map(tenant => (
                  <TenantRow
                    key={tenant.id}
                    name={tenant.name}
                    plan={tenant.plan}
                    devices={tenant.devices}
                    status={tenant.status}
                    created={tenant.createdAt}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-400">No tenants found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TenantRow({
  name,
  plan,
  devices,
  status,
  created,
}: {
  name: string;
  plan: string;
  devices: number;
  status: string;
  created: string;
}) {
  const statusColor = status === 'Active' ? 'text-green-400' : 'text-red-400';
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
      <td className="py-3 font-medium">{name}</td>
      <td className="py-3 text-slate-400">{plan}</td>
      <td className="py-3">{devices}</td>
      <td className={`py-3 ${statusColor}`}>{status}</td>
      <td className="py-3 text-slate-400">
        {created ? new Date(created).toLocaleDateString() : '—'}
      </td>
    </tr>
  );
}
