import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Battery, Wifi, Zap, Activity, ChevronDown, ChevronUp, Info, Clock, MapPin, User, Monitor,
  Play, Pause, RotateCcw, Power, RefreshCw, Shield, AlertTriangle, CheckCircle,
  GitBranch, ScrollText, History, BarChart3, Bell,
} from 'lucide-react';
import { useState } from 'react';
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
import { deviceService } from '@/services/device.service';
import { cn } from '@/lib/utils';

interface DeviceMetrics {
  battery: number;
  temperature: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  signalStrength: number;
  uptime: string;
}

interface Device {
  id: string;
  name: string;
  model: string;
  osVersion: string;
  status: string;
  metrics: DeviceMetrics;
  location: string;
  owner: string;
  lastSeen: string;
  healthStatus?: string;
}

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [actionTab, setActionTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [approvalOpen, setApprovalOpen] = useState(false);

  const { data: device, isLoading } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: deviceId,
        name: 'iPhone 14 Pro',
        model: 'Apple iPhone 14 Pro',
        osVersion: 'iOS 17.2',
        status: 'online',
        metrics: {
          battery: 85,
          temperature: 35,
          cpuUsage: 22,
          memoryUsage: 68,
          storageUsage: 42,
          signalStrength: 95,
          uptime: '12h 30m',
        },
        location: 'Lab A',
        owner: 'QA Team',
        lastSeen: '2025-01-15T10:30:00Z',
        healthStatus: 'healthy',
      } as Device;
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-muted-foreground">Loading device details...</div>
      </PageContainer>
    );
  }

  if (!device) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-red-600">Device not found</div>
      </PageContainer>
    );
  }

  const statusBadgeClass =
    device.status === 'online'
      ? 'bg-emerald-100 text-emerald-800'
      : device.status === 'offline'
        ? 'bg-gray-100 text-gray-800'
        : 'bg-amber-100 text-amber-800';

  const isDestructive = confirmAction === 'reboot' || confirmAction === 'stop';

  const handleConfirmedAction = async () => {
    try {
      await deviceService.sendCommand(device.id, confirmAction || '');
      setConfirmAction(null);
      setApprovalOpen(false);
    } catch (e) {
      console.error('Action failed', e);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={device.name}
        description={device.model}
        breadcrumbs={[{ label: 'Devices', href: '/devices' }, { label: device.name }]}
        actions={[
          { label: 'Screenshot', onClick: () => {} },
          { label: 'Reboot', onClick: () => setConfirmAction('reboot'), variant: 'secondary' },
        ]}
      />

      {/* Section 1: Overview + Live Status */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="sr-only">Device Overview</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Battery</p>
                  <p className="text-2xl font-bold">{device.metrics.battery}%</p>
                </div>
                <Battery className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connection</p>
                  <p className="text-2xl font-bold">{device.metrics.signalStrength}%</p>
                </div>
                <Wifi className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <p className="text-2xl font-bold">{device.metrics.cpuUsage}% CPU</p>
                </div>
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Memory</p>
                  <p className="text-2xl font-bold">{device.metrics.memoryUsage}%</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>About this device</CardTitle>
              <CardDescription>Key information and current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Monitor className="h-3.5 w-3.5" /> Model
                  </p>
                  <p className="font-semibold">{device.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operating System</p>
                  <p className="font-semibold">{device.osVersion}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`mt-1 ${statusBadgeClass}`}>
                    {device.status === 'online' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </p>
                  <p className="font-semibold">{device.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" /> Assigned to
                  </p>
                  <p className="font-semibold">{device.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Uptime
                  </p>
                  <p className="font-semibold">{device.metrics.uptime}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Used</span>
                    <span className="text-sm font-bold">{device.metrics.storageUsage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${device.metrics.storageUsage}%` }}
                    />
                  </div>
                </div>
                <Button className="w-full">Clear Cache</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Operational Sections */}
      <Tabs value={actionTab} onValueChange={setActionTab} className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Overview
          </TabsTrigger>
          <TabsTrigger value="session">
            <Play className="h-3.5 w-3.5 mr-1" /> Live Session
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="h-3.5 w-3.5 mr-1" /> Health & Telemetry
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <GitBranch className="h-3.5 w-3.5 mr-1" /> Active Workflows
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <ScrollText className="h-3.5 w-3.5 mr-1" /> Evidence
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-3.5 w-3.5 mr-1" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Device Overview</CardTitle>
              <CardDescription>Summary of device state and quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setConfirmAction('reboot')}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Restart
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" /> Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setConfirmAction('reboot')}>
                      Restart
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction('maintenance')}>
                      Set Maintenance
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction('allocate')}>
                      Reserve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmAction('release')}>
                      Unreserve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setApprovalOpen(true)}>
                      Re-provision
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={() => {}}>
                  <Bell className="mr-2 h-4 w-4" /> Open Session
                </Button>
                {device.healthStatus === 'critical' && (
                  <Badge variant="destructive">Needs Attention</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardHeader>
              <CardTitle>Live Session</CardTitle>
              <CardDescription>Current session and real-time status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span className="font-medium">Session Active</span>
                <span className="text-sm text-muted-foreground">Last activity: 2s ago</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">No active sessions. Device is monitoring idle.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Health & Telemetry</CardTitle>
              <CardDescription>System health metrics and diagnostics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Temperature</p>
                  <p className="text-xl font-bold">{device.metrics.temperature}°C</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">CPU</p>
                  <p className="text-xl font-bold">{device.metrics.cpuUsage}%</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Memory</p>
                  <p className="text-xl font-bold">{device.metrics.memoryUsage}%</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Storage</p>
                  <p className="text-xl font-bold">{device.metrics.storageUsage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Currently running and queued workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Smoke Test Suite</p>
                    <p className="text-xs text-muted-foreground">Running • Started 5 min ago</p>
                  </div>
                  <Badge variant="default">Running</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Provision Check</p>
                    <p className="text-xs text-muted-foreground">Queued • ETA 12 min</p>
                  </div>
                  <Badge variant="secondary">Queued</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>Screenshots, logs, and recorded evidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Button size="sm" variant="outline">
                  <ScrollText className="mr-1 h-4 w-4" /> View Evidence
                </Button>
                <Button size="sm" variant="outline">
                  <Bell className="mr-1 h-4 w-4" /> Notifications
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">No recent evidence. Run a workflow to generate evidence.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>Device action history and audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Reboot completed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago • Success</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Maintenance exited</p>
                    <p className="text-xs text-muted-foreground">Yesterday • Success</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">App crash detected</p>
                    <p className="text-xs text-muted-foreground">2 days ago • Warning</p>
                  </div>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval-gated destructive actions dialog */}
      <AlertDialog open={approvalOpen} onOpenChange={setApprovalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approval Required: Re-provision</AlertDialogTitle>
            <AlertDialogDescription>
              Re-provisioning {device.name} will reset the device to factory state and
              re-apply the current configuration profile. This action requires supervisor approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setApprovalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedAction}>
              Confirm & Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Standard destructive action confirmation */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm: {confirmAction}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction} {device.name}? This action will take effect immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedAction}
              className={cn(isDestructive && 'bg-destructive text-destructive-foreground')}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
