import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolCallCard } from '@/components/agentic/ToolCallCard';
import { Clock, Zap, TrendingUp } from 'lucide-react';

export default function AgentRunDetail() {
  const { runId } = useParams<{ runId: string }>();

  const { data: run, isLoading } = useQuery({
    queryKey: ['agent-run', runId],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: runId,
        agentName: 'Content Generator',
        status: 'running',
        startTime: '2025-01-15T10:30:00Z',
        tokensUsed: 4250,
        cost: 0.042,
        tasksCompleted: 3,
        tasksTotal: 5,
        toolCalls: [
          {
            id: 'tool-1',
            toolName: 'web_search',
            input: { query: 'latest AI trends' },
            status: 'completed',
            result: 'Found 10 relevant articles...',
            duration: 2300,
          },
          {
            id: 'tool-2',
            toolName: 'summarize',
            input: { text: 'Long article text...' },
            status: 'completed',
            result: 'Summary generated successfully',
            duration: 1500,
          },
          {
            id: 'tool-3',
            toolName: 'generate_content',
            input: { topic: 'AI trends', style: 'blog' },
            status: 'running',
            result: null,
            duration: null,
          },
        ],
      };
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-center py-8">Loading run details...</div>
      </PageContainer>
    );
  }

  if (!run) {
    return (
      <PageContainer>
        <div className="text-center py-8 text-red-600">Run not found</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`${run.agentName} - Run ${runId}`}
        description="Detailed agent run execution details"
        breadcrumbs={[{ label: 'Agents' }, { label: 'Runs' }, { label: runId || 'Detail' }]}
      />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-2">{run.status}</Badge>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Used</p>
                <p className="text-2xl font-bold mt-2">{run.tokensUsed.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold mt-2">
                {run.tasksCompleted}/{run.tasksTotal}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cost</p>
                <p className="text-2xl font-bold mt-2">${run.cost.toFixed(3)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Timeline</CardTitle>
          <CardDescription>Tool calls and agent reasoning steps</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="mt-4">
              <div className="space-y-4">
                {run.toolCalls.map((call: any) => (
                  <ToolCallCard
                    key={call.id}
                    call={{ ...call, toolType: call.toolType ?? call.toolName }}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="mt-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">Agent:</span> Processing content generation
                    request...
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    <span className="font-semibold">User:</span> Generate content about AI trends
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="memory" className="mt-4">
              <div className="space-y-3">
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Short-term Memory</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current task context and recent decisions
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-sm font-medium">Long-term Memory</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Persistent knowledge and patterns
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
