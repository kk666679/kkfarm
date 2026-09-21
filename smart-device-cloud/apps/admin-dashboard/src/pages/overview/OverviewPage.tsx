import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import { PageTitle } from '@/components/common/PageTitle';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Server,
  Cpu,
  HardDrive,
  Wifi,
} from 'lucide-react';

export default function OverviewPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['fleet', 'metrics'],
    queryFn: () => cloudService.getFleetMetrics(),
    refetchInterval: 30000,
  });

  const kpiCards = [
    { label: 'Total Devices', value: metrics?.totalDevices ?? 0, icon: Server },
    { label: 'Online', value: metrics?.onlineDevices ?? 0, icon: Wifi, color: 'text-green-400' },
    {
      label: 'Degraded',
      value: metrics?.degradedDevices ?? 0,
      icon: AlertCircle,
      color: 'text-yellow-400',
    },
    { label: 'Offline', value: metrics?.offlineDevices ?? 0, icon: Wifi, color: 'text-red-400' },
    { label: 'CPU Usage', value: metrics ? `${metrics.avgCpuUsage}%` : '--', icon: Cpu },
    {
      label: 'Memory Usage',
      value: metrics ? `${metrics.avgMemoryUsage}%` : '--',
      icon: HardDrive,
    },
    { label: 'Avg Temp', value: metrics ? `${metrics.avgTemperature}°C` : '--', icon: TrendingUp },
    { label: 'Workloads', value: metrics?.runningWorkloads ?? 0, icon: Server },
  ];

  return (
    <div className="space-y-6">
      <PageTitle
        title="Dashboard Overview"
        subtitle="Real-time fleet monitoring and intelligence"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-400">{card.label}</CardTitle>
                {card.icon &&
                  (isLoading ? (
                    <Skeleton className="h-4 w-4" />
                  ) : (
                    <card.icon className={`h-4 w-4 ${card.color ?? ''}`} />
                  ))}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && !metrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Fleet Health</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !metrics ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Online</span>
                      <span className="text-green-400">{metrics.onlineDevices}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{
                          width: `${(metrics.onlineDevices / metrics.totalDevices) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Degraded</span>
                      <span className="text-yellow-400">{metrics.degradedDevices}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full">
                      <div
                        className="h-2 bg-yellow-500 rounded-full"
                        style={{
                          width: `${(metrics.degradedDevices / metrics.totalDevices) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Offline</span>
                      <span className="text-red-400">{metrics.offlineDevices}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{
                          width: `${(metrics.offlineDevices / metrics.totalDevices) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <StatusItem label="API Gateway" status="ok" />
              <StatusItem label="Telemetry" status="ok" />
              <StatusItem label="Workload Manager" status="ok" />
              <StatusItem label="Analytics" status="ok" />
              <StatusItem label="Database" status="ok" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48" />
            ) : (
              <div className="space-y-3">
                <Activity className="h-5 w-5 text-slate-400" />
                <p className="text-sm text-slate-400">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <StatItem label="Avg CPU" value={metrics ? `${metrics.avgCpuUsage}%` : '--'} />
                <StatItem
                  label="Avg Memory"
                  value={metrics ? `${metrics.avgMemoryUsage}%` : '--'}
                />
                <StatItem label="Avg Temp" value={metrics ? `${metrics.avgTemperature}°C` : '--'} />
                <StatItem label="Uptime" value="99.97%" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: 'ok' | 'warn' | 'error' }) {
  const colors = { ok: 'text-green-400', warn: 'text-yellow-400', error: 'text-red-400' };
  const icons = { ok: CheckCircle, warn: AlertCircle, error: AlertCircle };
  const Icon = icons[status];
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-300">{label}</span>
      <Icon className={`h-4 w-4 ${colors[status]}`} />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
