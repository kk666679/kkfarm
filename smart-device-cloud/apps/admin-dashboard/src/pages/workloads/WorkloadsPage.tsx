import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService, type Workload } from '@/services/api';
import {
  Play,
  Square,
  Trash2,
  Plus,
  Filter,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  PauseCircle,
} from 'lucide-react';

export default function WorkloadsPage() {
  const [filter, setFilter] = useState('');
  const { data: workloads, isLoading } = useQuery({
    queryKey: ['dashboard', 'workloads'],
    queryFn: () => cloudService.getWorkloads(),
    refetchInterval: 60000,
  });

  const filtered = workloads?.filter(
    (w: Workload) =>
      w.name.toLowerCase().includes(filter.toLowerCase()) ||
      w.category.toLowerCase().includes(filter.toLowerCase())
  );

  const statusIcons = {
    Running: Play,
    Completed: CheckCircle,
    Failed: XCircle,
    Paused: PauseCircle,
  };

  const statusColors = {
    Running: 'text-green-400',
    Completed: 'text-blue-400',
    Failed: 'text-red-400',
    Paused: 'text-yellow-400',
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Workloads" subtitle="Manage and orchestrate workloads across your fleet" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <WorkloadStatCard label="Total" count={workloads?.length ?? 0} />
        <WorkloadStatCard
          label="Running"
          count={workloads?.filter((w: Workload) => w.status === 'Running').length ?? 0}
          color="text-green-400"
        />
        <WorkloadStatCard
          label="Completed"
          count={workloads?.filter((w: Workload) => w.status === 'Completed').length ?? 0}
          color="text-blue-400"
        />
        <WorkloadStatCard
          label="Failed"
          count={workloads?.filter((w: Workload) => w.status === 'Failed').length ?? 0}
          color="text-red-400"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter workloads..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Workload
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workload List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filtered?.length === 0 ? (
            <div className="text-center py-8 text-slate-400">No workloads found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Device</th>
                  <th className="pb-3">Created</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((workload: Workload) => {
                  const StatusIcon =
                    statusIcons[workload.status as keyof typeof statusIcons] ?? Clock;
                  return (
                    <tr
                      key={workload.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50"
                    >
                      <td className="py-3 font-medium">{workload.name}</td>
                      <td
                        className={`py-3 ${statusColors[workload.status as keyof typeof statusColors] ?? 'text-slate-400'}`}
                      >
                        <div className="flex items-center gap-1">
                          <StatusIcon className="h-3.5 w-3.5" />
                          {workload.status}
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">{workload.category}</td>
                      <td className="py-3 text-slate-400">{workload.deviceId ?? '-'}</td>
                      <td className="py-3 text-slate-400">{workload.createdAt}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Square className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkloadStatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color ?? ''}`}>{count}</div>
      </CardContent>
    </Card>
  );
}
