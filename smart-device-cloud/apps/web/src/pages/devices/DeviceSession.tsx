import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIOperationsPanel } from '@/components/ai/AIOperationsPanel';
import { Terminal } from '@/components/ai-elements/terminal';
import {
  Smartphone,
  Battery,
  Wifi,
  Zap,
  Activity,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Camera,
  Download,
  Settings,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

export default function DeviceSessionPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [sessionTab, setSessionTab] = useState('session');
  const [isConnected, setIsConnected] = useState(true);

  const { data: device, isLoading } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        id: deviceId,
        name: 'Pixel 8 Pro',
        model: 'Google Pixel 8 Pro',
        osVersion: 'Android 15',
        status: 'online',
        battery: 78,
        pool: 'Production Android',
        assignedTo: 'QA Team',
      };
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8">Loading session...</div>
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

  return (
    <PageContainer>
      <PageHeader
        title={device.name}
        description={`${device.model} • ${device.osVersion} • ${device.pool}`}
        breadcrumbs={[{ label: 'Devices', href: '/devices' }, { label: device.name }]}
        actions={[
          { label: 'Back', icon: <ArrowLeft className="h-4 w-4" />, onClick: () => window.history.back() },
        ]}
      />

      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
              <div>
                <span className="font-semibold">{device.name}</span>
                <Badge className="ml-2" variant={device.status === 'online' ? 'default' : 'secondary'}>
                  {device.status === 'online' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsConnected(!isConnected)}>
                {isConnected ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                {isConnected ? 'Pause' : 'Resume'}
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-1" /> Camera
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Record
              </Button>
              <Button variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-1" /> Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={sessionTab} onValueChange={setSessionTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="session">Live Session</TabsTrigger>
          <TabsTrigger value="ai">AI Operations</TabsTrigger>
          <TabsTrigger value="console">Console</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>

        <TabsContent value="session">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Live Device Screen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Smartphone className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">Device screen stream</p>
                    <p className="text-xs mt-1">{isConnected ? 'Connected' : 'Disconnected'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <AIOperationsPanel
              deviceContext={{
                id: device.id,
                name: device.name,
                status: device.status,
              }}
              plan={[
                { id: '1', name: 'Open target app', status: 'completed' },
                { id: '2', name: 'Navigate to checkout', status: 'running' },
                { id: '3', name: 'Verify payment flow', status: 'pending' },
                { id: '4', name: 'Capture evidence', status: 'pending' },
              ]}
              tools={[
                { name: 'device.appLaunch', status: 'output-available' },
                { name: 'device.navigate', status: 'input-streaming' },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Execution Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Open target app — Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                    <span className="text-sm">Navigate to checkout — Running</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Verify payment flow — Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-muted-foreground">Capture evidence — Pending</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Tool Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-xs font-mono">device.appLaunch</span>
                    <Badge variant="secondary">Done</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-xs font-mono">device.navigate</span>
                    <Badge variant="secondary">Running</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="console">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Device Console
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Terminal output="Terminal output loading..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Evidence & Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <CardTitle className="text-sm font-semibold mb-3">Test Results</CardTitle>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>App launch: Passed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Navigation: Passed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>Checkout: In Progress</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <CardTitle className="text-sm font-semibold mb-3">Recent Evidence</CardTitle>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Camera at 10:42 — Checkout screen</p>
                    <p>• Log at 10:41 — App state synchronized</p>
                    <p>• Device state at 10:40 — Battery 78%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
