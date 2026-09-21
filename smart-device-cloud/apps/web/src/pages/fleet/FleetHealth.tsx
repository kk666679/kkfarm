'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  RefreshCw,
  Download,
  Filter,
  MoreVertical,
  Zap,
  Wifi,
  HardDrive,
  Thermometer,
  Battery,
  Activity,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface SubsystemCheck {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  lastCheck: string;
  details: string;
  affectedDevices: number;
}

interface Alert {
  id: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  deviceCount: number;
  region?: string;
}

interface RemediationAction {
  id: string;
  alert: string;
  action: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export default function FleetHealth() {
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('subsystems');

  // Subsystem checks query
  const {
    data: subsystems,
    isLoading: subsystemsLoading,
    refetch: refetchSubsystems,
  } = useQuery({
    queryKey: ['fleet', 'health', 'subsystems'],
    queryFn: async () => {
      return [
        {
          name: 'Battery Management',
          status: 'healthy',
          lastCheck: '2 minutes ago',
          details: 'All battery levels optimal',
          affectedDevices: 0,
        },
        {
          name: 'Network Connectivity',
          status: 'warning',
          lastCheck: '1 minute ago',
          details: '42 devices with elevated latency',
          affectedDevices: 42,
        },
        {
          name: 'Storage Systems',
          status: 'healthy',
          lastCheck: '3 minutes ago',
          details: 'Average storage utilization at 65%',
          affectedDevices: 0,
        },
        {
          name: 'Thermal Management',
          status: 'critical',
          lastCheck: 'Just now',
          details: '12 devices exceeding temperature limits',
          affectedDevices: 12,
        },
        {
          name: 'CPU Performance',
          status: 'healthy',
          lastCheck: '2 minutes ago',
          details: 'Average CPU usage within normal range',
          affectedDevices: 0,
        },
        {
          name: 'Memory Systems',
          status: 'warning',
          lastCheck: '1 minute ago',
          details: '8 devices with high memory pressure',
          affectedDevices: 8,
        },
      ] as SubsystemCheck[];
    },
    refetchInterval: 30000,
  });

  // Alert timeline query
  const {
    data: alerts,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['fleet', 'health', 'alerts'],
    queryFn: async () => {
      return [
        {
          id: '1',
          timestamp: '2 minutes ago',
          severity: 'critical',
          title: 'High Temperature Alert',
          description: 'Thermal sensors detected 12 devices exceeding 50°C threshold',
          deviceCount: 12,
          region: 'Asia Pacific',
        },
        {
          id: '2',
          timestamp: '15 minutes ago',
          severity: 'warning',
          title: 'Network Latency Spike',
          description: '42 devices reporting latency above 100ms',
          deviceCount: 42,
          region: 'Europe',
        },
        {
          id: '3',
          timestamp: '28 minutes ago',
          severity: 'warning',
          title: 'High Memory Pressure',
          description: '8 devices with memory utilization above 85%',
          deviceCount: 8,
          region: 'North America',
        },
        {
          id: '4',
          timestamp: '1 hour ago',
          severity: 'info',
          title: 'Maintenance Window Completed',
          description: 'Firmware update completed on 156 devices',
          deviceCount: 156,
        },
        {
          id: '5',
          timestamp: '2 hours ago',
          severity: 'critical',
          title: 'Connectivity Loss',
          description: '24 devices went offline simultaneously',
          deviceCount: 24,
          region: 'Latin America',
        },
      ] as Alert[];
    },
    refetchInterval: 30000,
  });

  // Remediation actions query
  const { data: remediations, isLoading: remediationsLoading } = useQuery({
    queryKey: ['fleet', 'health', 'remediations'],
    queryFn: async () => {
      return [
        {
          id: '1',
          alert: 'High Temperature Alert',
          action: 'Reduce thermal load on affected devices',
          status: 'in_progress',
          createdAt: '2 minutes ago',
        },
        {
          id: '2',
          alert: 'Network Latency Spike',
          action: 'Failover to backup network path',
          status: 'in_progress',
          createdAt: '15 minutes ago',
        },
        {
          id: '3',
          alert: 'High Memory Pressure',
          action: 'Clear cache and restart services',
          status: 'completed',
          createdAt: '28 minutes ago',
          completedAt: '25 minutes ago',
        },
        {
          id: '4',
          alert: 'Connectivity Loss',
          action: 'Investigate network infrastructure',
          status: 'pending',
          createdAt: '2 hours ago',
        },
      ] as RemediationAction[];
    },
    refetchInterval: 30000,
  });

  const SubsystemCheckCard = (check: SubsystemCheck) => {
    const statusConfig = {
      healthy: {
        bg: 'bg-green-50 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        color: 'text-green-600',
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: AlertTriangle,
        color: 'text-yellow-600',
      },
      critical: {
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        color: 'text-red-600',
      },
    };

    const config = statusConfig[check.status];
    const StatusIcon = config.icon;

    return (
      <div key={check.name} className={cn('rounded-lg border p-4', config.bg, config.border)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <StatusIcon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.color)} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium">{check.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{check.details}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {check.lastCheck}
                </span>
                {check.affectedDevices > 0 && (
                  <span className="font-medium text-red-600">
                    {check.affectedDevices} device{check.affectedDevices !== 1 ? 's' : ''} affected
                  </span>
                )}
              </div>
            </div>
          </div>
          {check.status !== 'healthy' && (
            <Button variant="outline" size="sm" className="ml-2 flex-shrink-0">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Remediate
            </Button>
          )}
        </div>
      </div>
    );
  };

  const AlertItem = (alert: Alert) => {
    const severityConfig = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-l-4 border-blue-500',
        badge: 'bg-blue-100 text-blue-800',
      },
      warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        border: 'border-l-4 border-yellow-500',
        badge: 'bg-yellow-100 text-yellow-800',
      },
      critical: {
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-l-4 border-red-500',
        badge: 'bg-red-100 text-red-800',
      },
    };

    const config = severityConfig[alert.severity];

    return (
      <div
        key={alert.id}
        className={cn(
          'rounded-lg p-4',
          config.bg,
          config.border,
          'cursor-pointer hover:opacity-80 transition-opacity'
        )}
        onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{alert.title}</h4>
              <Badge className={config.badge}>{alert.severity.toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {alert.timestamp}
              </span>
              <span>{alert.deviceCount} device(s)</span>
              {alert.region && <span>{alert.region}</span>}
            </div>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </div>
    );
  };

  const RemediationCard = (action: RemediationAction) => {
    const statusConfig = {
      pending: { color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30' },
      in_progress: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
      completed: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
      failed: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
    };

    const config = statusConfig[action.status];

    return (
      <Card key={action.id} className={config.bg}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{action.alert}</p>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs capitalize',
                  action.status === 'completed' && 'bg-green-100 text-green-800',
                  action.status === 'in_progress' && 'bg-blue-100 text-blue-800',
                  action.status === 'failed' && 'bg-red-100 text-red-800',
                  action.status === 'pending' && 'bg-gray-100 text-gray-800'
                )}
              >
                {action.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{action.action}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Started: {action.createdAt}</span>
              {action.completedAt && <span>Completed: {action.completedAt}</span>}
            </div>
            {action.status === 'in_progress' && (
              <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-2/3 animate-pulse" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const isLoading = subsystemsLoading || alertsLoading || remediationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const healthyCount = subsystems?.filter(s => s.status === 'healthy').length || 0;
  const warningCount = subsystems?.filter(s => s.status === 'warning').length || 0;
  const criticalCount = subsystems?.filter(s => s.status === 'critical').length || 0;
  const criticalAlerts = alerts?.filter(a => a.severity === 'critical').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Health</h1>
          <p className="text-muted-foreground">
            Monitor subsystems, manage alerts, and execute remediation actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => void refetchSubsystems()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Healthy Systems</p>
                <p className="text-2xl font-bold mt-1 text-green-600">{healthyCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold mt-1 text-yellow-600">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold mt-1 text-red-600">{criticalCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold mt-1">{alerts?.length || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="subsystems">Subsystem Checks</TabsTrigger>
          <TabsTrigger value="alerts">
            Alert Timeline
            {criticalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="remediation">Remediation Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="subsystems" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subsystem Health Status</span>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subsystems?.map(subsystem => (
                <SubsystemCheckCard key={subsystem.name} {...subsystem} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Alert Timeline</h3>
                <p className="text-sm text-muted-foreground">Real-time alert history and status</p>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
            <div className="space-y-2">
              {alerts?.map(alert => (
                <AlertItem key={alert.id} {...alert} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="remediation" className="space-y-4">
          <div>
            <h3 className="font-semibold mb-4">Active Remediation Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {remediations?.map(action => (
                <RemediationCard key={action.id} {...action} />
              ))}
            </div>
          </div>

          {remediations && remediations.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No active remediation actions needed</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
