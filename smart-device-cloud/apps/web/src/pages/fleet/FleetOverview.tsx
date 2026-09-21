'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRecommendations, getFleetMetrics } from '@/services/api.service';
import { deviceService } from '@/services/device.service';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Activity,
  AlertTriangle,
  Bell,
  Brain,
  Check,
  Clock,
  Cpu,
  GitBranch,
  Layers,
  Monitor,
  Phone,
  RefreshCw,
  Shield,
  X,
  Zap,
} from 'lucide-react';
import type { Recommendation } from '@smart-device-cloud/shared';
import { cn } from '@/lib/utils';

export default function FleetOverview() {
  const { data: recommendations, isLoading: recLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => getRecommendations(),
    refetchInterval: 5 * 60_000,
  });

  const { data: fleetMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['fleet-metrics'],
    queryFn: () => getFleetMetrics(),
    refetchInterval: 30_000,
  });

  const { data: deviceStats } = useQuery({
    queryKey: ['device-stats'],
    queryFn: () => deviceService.getDeviceStats(),
    refetchInterval: 30_000,
  });

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [poolFilter, setPoolFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [versionFilter, setVersionFilter] = useState<string>('all');

  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [alertFilter, setAlertFilter] = useState<string>('all');

  const pools = useMemo(() => ['Pool A', 'Pool B', 'Pool C', 'Pool D'], []);
  const androidVersions = useMemo(() => ['Android 13', 'Android 14', 'Android 15'], []);
  const workflows = useMemo(() => ['Smoke Test', 'Regression', 'Perf Test', 'Provision'], []);

  const toggleDevice = (id: string) => {
    setSelectedDevices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
  };

  const executeBulkAction = async () => {
    if (!bulkAction || selectedDevices.size === 0) return;
    try {
      for (const deviceId of selectedDevices) {
        await deviceService.sendCommand(deviceId, bulkAction);
      }
      setBulkAction(null);
      setSelectedDevices(new Set());
    } catch (e) {
      console.error('Bulk action failed', e);
    }
  };

  const summaryCards = [
    { label: 'Total Devices', value: deviceStats?.total ?? 0, icon: Phone, color: 'blue' as const },
    { label: 'Online', value: deviceStats?.available ?? 0, icon: Activity, color: 'green' as const },
    { label: 'Offline', value: deviceStats?.offline ?? 0, icon: Bell, color: 'red' as const },
    { label: 'Busy', value: deviceStats?.in_use ?? 0, icon: Cpu, color: 'purple' as const },
    { label: 'Maintenance', value: deviceStats?.maintenance ?? 0, icon: Shield, color: 'yellow' as const },
    { label: 'Session Load', value: fleetMetrics?.activeSessions ?? 0, icon: Monitor, color: 'sky' as const },
    { label: 'Queue Pressure', value: fleetMetrics?.runningWorkloads ?? 0, icon: Clock, color: 'amber' as const },
    { label: 'Automation', value: workflows.length, icon: GitBranch, color: 'emerald' as const },
  ];

  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
    sky: 'bg-sky-500/10 text-sky-500',
    amber: 'bg-amber-500/10 text-amber-500',
    emerald: 'bg-emerald-500/10 text-emerald-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Fleet Control</h1>
          <p className="text-sm text-muted-foreground">
            Device pools, health, session load, automation, queue pressure, and incidents
          </p>
        </div>
        {selectedDevices.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                Bulk Action ({selectedDevices.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkAction('reboot')}>
                <RefreshCw className="mr-2 h-4 w-4" /> Bulk Reboot
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('allocate')}>
                <Zap className="mr-2 h-4 w-4" /> Bulk Allocate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('drain')}>
                <Bell className="mr-2 h-4 w-4" /> Bulk Drain
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('maintenance')}>
                <Shield className="mr-2 h-4 w-4" /> Set Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkAction('retry')}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retry Failed Tasks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={(v: string | null) => setStatusFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={poolFilter} onValueChange={(v: string | null) => setPoolFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Pool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pools</SelectItem>
            {pools.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={healthFilter} onValueChange={(v: string | null) => setHealthFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Health" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Health</SelectItem>
            <SelectItem value="healthy">Healthy</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={versionFilter} onValueChange={(v: string | null) => setVersionFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Android" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Versions</SelectItem>
            {androidVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={alertFilter} onValueChange={(v: string | null) => setAlertFilter(v ?? 'all')}>
          <SelectTrigger className="h-8 w-auto">
            <SelectValue placeholder="Alert" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter !== 'all' || poolFilter !== 'all' || healthFilter !== 'all' || versionFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStatusFilter('all'); setPoolFilter('all'); setHealthFilter('all'); setVersionFilter('all'); }}
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryCards.map((card, i) => (
          <Card key={i} className="relative overflow-hidden transition-all hover:shadow-md">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
                  <p className="text-lg sm:text-xl font-bold">{card.value}</p>
                </div>
                <div className={cn('rounded-lg p-1.5', colorClasses[card.color])}>
                  <card.icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Brain className="h-4 w-4 text-amber-500" />
          AI Recommendations
        </h2>
        {recLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(recommendations ?? []).map((rec: Recommendation) => (
              <Card key={rec.id} className="border-white/5 bg-[#0f1525] p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{rec.description}</h3>
                    <p className="text-xs text-white/50 mt-1">{rec.rootCauseHypothesis}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(rec.confidence * 100)}%
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
                  <span>Affected: {rec.affectedDeviceCount} devices</span>
                  <span>•</span>
                  <span>Cluster: {rec.clusterId}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" variant="secondary" className="flex-1">
                    <Activity className="mr-1 h-3.5 w-3.5" /> Review
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Check className="mr-1 h-3.5 w-3.5" /> Apply
                  </Button>
                  <Button size="sm" variant="ghost">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Queue Pressure & Incident Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg p-2', colorClasses.amber)}>
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Queue Pressure</p>
                <p className="text-2xl font-bold">{fleetMetrics?.runningWorkloads ?? 0} tasks</p>
                {fleetMetrics?.runningWorkloads && fleetMetrics.runningWorkloads > 10 && (
                  <Badge variant="destructive" className="mt-1 text-[10px]">High</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg p-2', colorClasses.red)}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">2</p>
                <Badge variant="destructive" className="mt-1 text-[10px]">2 Critical</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-lg p-2', colorClasses.green)}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Automation</p>
                <p className="text-2xl font-bold">{workflows.length} workflows</p>
                <Badge variant="default" className="mt-1 text-[10px]">{workflows.length} Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk action confirmation */}
      <AlertDialog open={!!bulkAction} onOpenChange={() => setBulkAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm: {bulkAction}</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to {bulkAction} {selectedDevices.size} selected device(s). This action will affect all selected devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeBulkAction}>Execute</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
