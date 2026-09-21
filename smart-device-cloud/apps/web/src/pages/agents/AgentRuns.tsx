import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AgentRunTimeline } from '@/components/agentic/AgentRunTimeline';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface AgentRun {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  tokensUsed: number;
  cost: number;
  tasksCompleted: number;
  tasksTotal: number;
}

export default function AgentRuns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    data: runs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['agent-runs', searchQuery, statusFilter],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'run-001',
          agentId: 'agent-1',
          agentName: 'Content Generator',
          status: 'running' as const,
          startTime: '2025-01-15T10:30:00Z',
          tokensUsed: 4250,
          cost: 0.042,
          tasksCompleted: 3,
          tasksTotal: 5,
        },
        {
          id: 'run-002',
          agentId: 'agent-2',
          agentName: 'Device Manager',
          status: 'completed' as const,
          startTime: '2025-01-15T10:00:00Z',
          endTime: '2025-01-15T10:15:00Z',
          tokensUsed: 8500,
          cost: 0.085,
          tasksCompleted: 5,
          tasksTotal: 5,
        },
        {
          id: 'run-003',
          agentId: 'agent-3',
          agentName: 'Analyzer',
          status: 'failed' as const,
          startTime: '2025-01-15T09:50:00Z',
          endTime: '2025-01-15T10:00:00Z',
          tokensUsed: 2100,
          cost: 0.021,
          tasksCompleted: 2,
          tasksTotal: 5,
        },
      ] as AgentRun[];
    },
    refetchInterval: 5000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRuns =
    runs?.filter((run: AgentRun) => {
      const matchesSearch =
        run.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        run.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <PageContainer>
      <PageHeader
        title="Agent Runs"
        description="Monitor and manage active agent executions"
        breadcrumbs={[{ label: 'Agents' }, { label: 'Runs' }]}
        actions={[
          { label: 'Export', onClick: () => {} },
          { label: 'Clear History', onClick: () => {} },
        ]}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {runs?.filter((r: AgentRun) => r.status === 'running').length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Running</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {runs?.filter((r: AgentRun) => r.status === 'completed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {runs?.filter((r: AgentRun) => r.status === 'failed').length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                ${(runs?.reduce((sum: number, r: AgentRun) => sum + r.cost, 0) || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Total Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search runs by agent name or ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={value => setStatusFilter(value ?? 'all')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">Loading runs...</div>
            </CardContent>
          </Card>
        ) : filteredRuns.length > 0 ? (
          filteredRuns.map((run: AgentRun) => (
            <Card key={run.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{run.agentName}</h3>
                      <Badge className={getStatusColor(run.status)}>{run.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">ID: {run.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {run.tasksCompleted}/{run.tasksTotal} Tasks
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {run.tokensUsed.toLocaleString()} tokens • ${run.cost.toFixed(3)}
                    </p>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${(run.tasksCompleted / run.tasksTotal) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Started: {new Date(run.startTime).toLocaleString()}</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                No runs found matching your criteria
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
