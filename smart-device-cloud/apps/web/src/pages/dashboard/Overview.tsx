'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageContainer } from '@/components/layout/PageContainer';
import { analyticsService } from '@/services/analytics.service';
import { deviceService } from '@/services/device.service';
import { cn } from '@/lib/utils';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Activity,
  Bell,
  Zap,
  Clock,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Search,
  ArrowUpDown,
} from 'lucide-react';

interface FleetHealth {
  online: number;
  busy: number;
  idle: number;
  attention: number;
}

interface OperationItem {
  id: string;
  name: string;
  type: 'task' | 'agent';
  status: 'running' | 'executing' | 'queued' | 'completed' | 'failed';
  progress: number;
}

export default function DashboardOverview() {
  const [healthFilter, setHealthFilter] = useState('all');

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => analyticsService.getDashboardStats(),
    refetchInterval: 30000,
  });

  const { data: fleetHealth, isLoading: healthLoading } = useQuery({
    queryKey: [
      'dashboard',
      'fleetHealth',
      stats?.totalDevices,
      stats?.onlineDevices,
      stats?.runningTasks,
    ],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const totalDevices = stats?.totalDevices ?? 128;
      const onlineDevices = stats?.onlineDevices ?? 104;
      const busyDevices = Math.min(stats?.runningTasks ?? 71, onlineDevices);

      return {
        online: onlineDevices,
        busy: busyDevices,
        idle: Math.max(onlineDevices - busyDevices, 0),
        attention: 7,
      } satisfies FleetHealth;
    },
    refetchInterval: 15000,
  });

  const { data: operations, isLoading: opsLoading } = useQuery({
    queryKey: ['dashboard', 'operations'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        { id: '2048', name: 'Checkout Test', type: 'task' as const, status: 'running' as const, progress: 72 },
        { id: '2049', name: 'Regression Suite', type: 'task' as const, status: 'running' as const, progress: 45 },
        { id: '41', name: 'QA Agent', type: 'agent' as const, status: 'executing' as const, progress: 60 },
      ] satisfies OperationItem[];
    },
    refetchInterval: 10000,
  });

  const { data: aiAlert, isLoading: aiLoading } = useQuery({
    queryKey: ['dashboard', 'aiAlert'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return {
        message: '7 devices need attention',
        details: 'Connectivity issues detected in Pool B',
      };
    },
    refetchInterval: 30000,
  });

  const handleRefresh = useCallback(() => {
    refetchStats();
  }, [refetchStats]);

  const statusCardClass = (isPositive: boolean) =>
    cn(
      'flex-1 text-center py-3',
      isPositive ? 'bg-green-50' : 'bg-red-50'
    );

  const healthLabel = (label: string, value: number, isPositive: boolean) => (
    <div key={label}>
      <div className={cn('text-2xl font-bold', isPositive ? 'text-green-600' : 'text-red-600')}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );

  return (
    <PageContainer>
      {/* Greeting + Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Good morning — Fleet Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {stats?.totalDevices ?? 128} devices · {stats?.onlineDevices ?? 104} active ·{' '}
            {fleetHealth ? fleetHealth.idle : 17} idle ·{' '}
            {fleetHealth ? fleetHealth.attention : 7} attention needed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={healthFilter} onValueChange={(v) => setHealthFilter(v ?? '')}>
            <SelectTrigger className="h-8 w-auto">
              <SelectValue placeholder="Filter health" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Health</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fleet Health */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Fleet Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8 sm:gap-12">
            {fleetHealth && (
              <>
                {healthLabel('Online', fleetHealth.online, true)}
                {healthLabel('Busy', fleetHealth.busy, true)}
                {healthLabel('Idle', fleetHealth.idle, true)}
                {healthLabel('Attention', fleetHealth.attention, false)}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Operations + AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Operations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Active Operations</CardTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {opsLoading ? (
              <div className="space-y-2">
                <div className="h-12 animate-pulse bg-muted rounded" />
                <div className="h-12 animate-pulse bg-muted rounded" />
              </div>
            ) : operations?.map(op => (
              <div
                key={op.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    op.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  )} />
                  <div>
                    <div className="text-sm font-medium">{op.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {op.type === 'task' ? 'Task' : 'Agent'} #{op.id}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', (op.status as string) === 'failed' ? 'bg-red-500' : 'bg-blue-500')}
                      style={{ width: `${op.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{op.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Operations Copilot */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              AI Operations Copilot
            </CardTitle>
            <Badge variant="secondary">Active</Badge>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                <div className="h-4 w-1/2 animate-pulse bg-muted rounded" />
                <div className="h-8 w-32 animate-pulse bg-muted rounded mt-4" />
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground mb-1">{aiAlert?.message}</p>
                <p className="text-xs text-muted-foreground mb-4">{aiAlert?.details}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Inspect</Button>
                  <Button size="sm">Resolve</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Device Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: 'Just now', event: 'Device Pixel 8 Pro connected to Pool B', type: 'connect' },
                { time: '2m ago', event: 'Task Checkout Test started on 3 devices', type: 'task' },
                { time: '5m ago', event: 'Agent QA Agent completed verification cycle', type: 'agent' },
                { time: '8m ago', event: 'Alert: Low battery on Galaxy S23 (12%)', type: 'alert' },
                { time: '12m ago', event: 'Device iPhone 15 Pro entered maintenance', type: 'maintenance' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <div className={cn(
                    'h-2 w-2 rounded-full flex-shrink-0',
                    item.type === 'alert' ? 'bg-red-500' :
                    item.type === 'connect' ? 'bg-green-500' :
                    item.type === 'task' ? 'bg-blue-500' : 'bg-gray-400'
                  )} />
                  <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{item.time}</span>
                  <span className="text-sm">{item.event}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Queued</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Running</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <span className="font-semibold">183</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed</span>
                <span className="font-semibold text-red-600">7</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">2 Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <span className="text-sm">5 Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm">11 Info</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
