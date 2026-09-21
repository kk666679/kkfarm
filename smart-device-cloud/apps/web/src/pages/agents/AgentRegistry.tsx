import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Zap, Users, Play, Square, RotateCcw, Eye, CheckCircle, XCircle, AlertTriangle,
  Activity, Clock, BarChart3, GitBranch, ScrollText, Brain,
} from 'lucide-react';
import type { Recommendation } from '@smart-device-cloud/shared';
import { getRecommendations } from '@/services/api.service';
import { cn } from '@/lib/utils';

type AgentStatus = 'idle' | 'running' | 'waiting-approval' | 'failed' | 'degraded' | 'active' | 'inactive';

interface AgentRun {
  id: string;
  name: string;
  status: AgentStatus;
  startedAt: string;
  progress: number;
  steps: Array<{ name: string; status: 'pending' | 'running' | 'completed' | 'failed' }>;
  deviceCount: number;
  successRate: number;
}

interface Agent extends AgentRun {
  description: string;
  version: string;
  runCount: number;
  totalCost: number;
  lastUpdated: string;
  approvalRequired: boolean;
}

const statusConfig: Record<AgentStatus, { label: string; className: string; icon: any }> = {
  idle: { label: 'Idle', className: 'bg-gray-100 text-gray-800', icon: Zap },
  running: { label: 'Running', className: 'bg-blue-100 text-blue-800', icon: Play },
  'waiting-approval': { label: 'Awaiting Approval', className: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-800', icon: XCircle },
  degraded: { label: 'Degraded', className: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
  active: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-800', icon: Square },
};

export default function AgentRegistry() {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'agent-1',
          name: 'Content Generator',
          description: 'Generates marketing content and blog posts',
          version: '2.1.0',
          status: 'active' as AgentStatus,
          runCount: 156,
          successRate: 94.2,
          totalCost: 12.45,
          lastUpdated: '2025-01-10T00:00:00Z',
          approvalRequired: false,
          steps: [
            { name: 'Analyze brief', status: 'completed' },
            { name: 'Generate content', status: 'completed' },
            { name: 'Review quality', status: 'completed' },
          ],
          deviceCount: 0,
          progress: 100,
        },
        {
          id: 'agent-2',
          name: 'Device Manager',
          description: 'Manages device provisioning and configuration',
          version: '1.5.2',
          status: 'running' as AgentStatus,
          runCount: 89,
          successRate: 98.8,
          totalCost: 8.92,
          lastUpdated: '2025-01-15T00:00:00Z',
          approvalRequired: false,
          steps: [
            { name: 'Provision device', status: 'completed' },
            { name: 'Install apps', status: 'running' },
            { name: 'Verify state', status: 'pending' },
          ],
          deviceCount: 4,
          progress: 65,
        },
        {
          id: 'agent-3',
          name: 'Analyzer',
          description: 'Analyzes logs and generates reports',
          version: '1.0.0',
          status: 'inactive' as AgentStatus,
          runCount: 23,
          successRate: 85.0,
          totalCost: 2.15,
          lastUpdated: '2024-12-01T00:00:00Z',
          approvalRequired: false,
          steps: [
            { name: 'Collect logs', status: 'completed' },
            { name: 'Run analysis', status: 'completed' },
          ],
          deviceCount: 0,
          progress: 100,
        },
        {
          id: 'agent-4',
          name: 'Workflow Executor',
          description: 'Executes automated test workflows',
          version: '3.0.1',
          status: 'waiting-approval' as AgentStatus,
          runCount: 45,
          successRate: 92.5,
          totalCost: 5.67,
          lastUpdated: '2025-01-16T00:00:00Z',
          approvalRequired: true,
          steps: [
            { name: 'Load workflow', status: 'completed' },
            { name: 'Queue devices', status: 'completed' },
            { name: 'Execute tests', status: 'pending' },
          ],
          deviceCount: 8,
          progress: 40,
        },
      ] as Agent[];
    },
  });

  const [runData] = useState<AgentRun[]>([]);

  const getStatusConfig = (status: AgentStatus) => statusConfig[status] || statusConfig.idle;

  return (
    <PageContainer>
      <PageHeader
        title="Agent Operations"
        description="Agent catalog, active runs, execution history, and approval state"
        breadcrumbs={[{ label: 'Agents' }, { label: 'Operations' }]}
        actions={[
          { label: 'Import', onClick: () => {} },
          { label: 'Create', onClick: () => {} },
        ]}
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{agents?.length || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">Total Agents</p>
              </div>
              <Brain className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {agents?.filter(a => a.status === 'active' || a.status === 'running').length || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Running</p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-amber-600">
                  {agents?.filter(a => a.status === 'waiting-approval').length || 0}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Awaiting Approval</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  ${(agents?.reduce((sum: number, a: Agent) => sum + a.totalCost, 0) || 0).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Total Cost</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Catalog */}
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Zap className="h-4 w-4" /> Agent Catalog
      </h2>

      <div className="space-y-4 mb-8">
        {isLoading ? (
          <Card><CardContent className="pt-6"><div className="text-center py-8 text-muted-foreground">Loading agents...</div></CardContent></Card>
        ) : agents && agents.length > 0 ? (
          agents.map((agent: Agent) => {
            const sc = getStatusConfig(agent.status);
            const StatusIcon = sc.icon;
            return (
              <Card key={agent.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{agent.name}</h3>
                        <Badge className={sc.className}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {sc.label}
                        </Badge>
                        <Badge variant="outline">v{agent.version}</Badge>
                        {agent.approvalRequired && (
                          <Badge variant="destructive">Approval Required</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Runs</p>
                          <p className="font-semibold">{agent.runCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold">{agent.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Coverage</p>
                          <p className="font-semibold">{agent.deviceCount} devices</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Cost</p>
                          <p className="font-semibold">${agent.totalCost.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Evidence Panel */}
                      <div className="mt-4 border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <ScrollText className="h-3 w-3" /> Recent Evidence
                        </p>
                        <div className="flex items-center gap-2">
                          {agent.steps.map((step, i) => (
                            <div
                              key={i}
                              className={cn(
                                'flex items-center gap-1 rounded px-2 py-1 text-[10px]',
                                step.status === 'completed' && 'bg-green-50 text-green-700',
                                step.status === 'running' && 'bg-blue-50 text-blue-700',
                                step.status === 'failed' && 'bg-red-50 text-red-700',
                                step.status === 'pending' && 'bg-gray-50 text-gray-400'
                              )}
                            >
                              {step.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                              {step.status === 'running' && <Activity className="h-3 w-3 animate-pulse" />}
                              {step.status === 'failed' && <XCircle className="h-3 w-3" />}
                              {step.status === 'pending' && <Clock className="h-3 w-3" />}
                              {step.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Eye className="mr-1 h-4 w-4" /> Inspect
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <GitBranch className="mr-2 h-4 w-4" /> Execution History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="mr-2 h-4 w-4" /> Telemetry
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ScrollText className="mr-2 h-4 w-4" /> Evidence Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        onClick={() => {}}
                        disabled={agent.status === 'inactive'}
                      >
                        {agent.status === 'running' || agent.status === 'waiting-approval' ? 'Monitor' : 'Run'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card><CardContent className="pt-6"><div className="text-center py-8 text-muted-foreground">No agents available</div></CardContent></Card>
        )}
      </div>
    </PageContainer>
  );
}
