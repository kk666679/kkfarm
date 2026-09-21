import { useState } from 'react';
import { useParams } from 'react-router-dom';
import '@xyflow/react/dist/style.css';
import { Edge } from '@xyflow/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  CanvasProvider,
  WorkflowCanvas,
  CanvasBackground,
  CanvasControls,
  nodeTypes,
  edgeTypes,
  VariableInspector,
  ExecutionLogPanel,
  StatusBadge,
  EmptyState,
} from '@/components/workflows';
import { WorkflowDebugControls } from '@/components/workflows/WorkflowDebugControls';
import { WorkflowBreakpointsPanel } from '@/components/workflows/WorkflowBreakpointsPanel';
import { trpc } from '@/trpc/client';
import { useToast } from '@/components/ui/toaster';

type DebugStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export default function WorkflowDebugPage() {
  return (
    <CanvasProvider>
      <WorkflowDebugInner />
    </CanvasProvider>
  );
}

function WorkflowDebugInner() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const { toast } = useToast();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const query = trpc.workflow.byId.useQuery({ workflowId: workflowId! }, { enabled: !!workflowId });

  // Placeholder debug state — wire to your debug session hook
  const debug = {
    status: 'idle' as DebugStatus,
    currentNodeId: null as string | null,
    breakpoints: [] as string[],
    variables: {} as Record<string, unknown>,
    callStack: [] as Array<{ nodeId: string; function: string; line: number }>,
    logs: [] as Array<{
      timestamp: string;
      level: 'info' | 'warn' | 'error' | 'debug';
      message: string;
    }>,
    start: () => toast({ title: 'Debug started' }),
    pause: () => toast({ title: 'Paused' }),
    resume: () => toast({ title: 'Resumed' }),
    stop: () => toast({ title: 'Stopped' }),
    stepOver: () => toast({ title: 'Step over' }),
    stepInto: () => toast({ title: 'Step into' }),
    stepOut: () => toast({ title: 'Step out' }),
    continue: () => toast({ title: 'Continue' }),
    toggleBreakpoint: (id: string) => toast({ title: `Toggled breakpoint ${id.slice(0, 6)}` }),
    clearBreakpoints: () => toast({ title: 'Cleared breakpoints' }),
  };

  if (query.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Workflow Debugger" />
        <Skeleton className="h-[600px] w-full" />
      </PageContainer>
    );
  }

  if (query.isError || !query.data) {
    return (
      <PageContainer>
        <PageHeader title="Workflow Debugger" />
        <EmptyState title="Failed to load workflow" />
      </PageContainer>
    );
  }

  const workflow = query.data;
  const isActive = debug.status === 'running' || debug.status === 'paused';

  const decoratedNodes = (workflow.nodes ?? []).map((node: any) => ({
    ...node,
    data: {
      ...node.data,
      isBreakpoint: debug.breakpoints.includes(node.id),
      isCurrent: node.id === debug.currentNodeId,
      status: node.id === debug.currentNodeId ? 'running' : 'idle',
    },
  }));

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Workflow Debugger"
        description="Step through execution with breakpoints and variable inspection"
        breadcrumbs={[
          { label: 'Workflows', href: '/workflows' },
          { label: workflow.name, href: `/workflows/${workflowId}` },
          { label: 'Debug' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={debug.status as any} />
            <WorkflowDebugControls
              status={debug.status}
              breakpointCount={debug.breakpoints.length}
              onStart={debug.start}
              onPause={debug.pause}
              onResume={debug.resume}
              onStop={debug.stop}
              onStepOver={debug.stepOver}
              onStepInto={debug.stepInto}
              onStepOut={debug.stepOut}
              onContinue={debug.continue}
              onClearBreakpoints={debug.clearBreakpoints}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
        <div className="h-[600px] overflow-hidden rounded-lg border border-border bg-background">
          <WorkflowCanvas
            withProvider={false}
            nodes={decoratedNodes}
            edges={workflow.edges as Edge[]}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            onNodeClick={(_, node) => {
              setSelectedNodeId(node.id);
              if (!isActive) debug.toggleBreakpoint(node.id);
            }}
          >
            <CanvasBackground />
            <CanvasControls showMiniMap={false} />
          </WorkflowCanvas>
        </div>

        <Tabs defaultValue="variables" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="breakpoints">Breakpoints</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="m-0">
            <VariableInspector variables={debug.variables} callStack={debug.callStack} />
          </TabsContent>

          <TabsContent value="breakpoints" className="m-0">
            <WorkflowBreakpointsPanel
              nodes={decoratedNodes}
              breakpoints={debug.breakpoints}
              selectedNodeId={selectedNodeId}
              currentNodeId={debug.currentNodeId}
              onToggle={debug.toggleBreakpoint}
              disabled={isActive}
            />
          </TabsContent>

          <TabsContent value="logs" className="m-0">
            <ExecutionLogPanel logs={debug.logs} autoScroll />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
