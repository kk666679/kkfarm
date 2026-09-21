'use client';
import { useParams } from 'react-router-dom';
import '@xyflow/react/dist/style.css';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  CanvasProvider,
  WorkflowCanvas,
  CanvasBackground,
  CanvasControls,
  nodeTypes,
  edgeTypes,
  ExecutionLogPanel,
  ExecutionTimeline,
  ExecutionMetrics,
  StatusBadge,
  EmptyState,
} from '@/components/workflows';
import { WorkflowRunControls, type RunStatus } from '@/components/workflows/WorkflowRunControls';
import { trpc } from '@/trpc/client';
import { useWorkflowExecution } from '@/components/workflows';
import { useToast } from '@/components/ui/toaster';

export default function WorkflowRunPage() {
  return (
    <CanvasProvider>
      <WorkflowRunInner />
    </CanvasProvider>
  );
}

function WorkflowRunInner() {
  const { workflowId, executionId } = useParams<{ workflowId: string; executionId: string }>();
  const { toast } = useToast();

  const execution = useWorkflowExecution({ executionId: executionId ?? null });
  const executionQuery = trpc.workflow.byId.useQuery(
    { workflowId: workflowId! },
    { enabled: !!workflowId && !!executionId }
  );

  if (executionQuery.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Workflow Execution" />
        <Skeleton className="h-[500px] w-full" />
      </PageContainer>
    );
  }

  if (executionQuery.isError) {
    return (
      <PageContainer>
        <PageHeader title="Workflow Execution" />
        <EmptyState title="Failed to load execution" description={executionQuery.error.message} />
      </PageContainer>
    );
  }

  const executionData = executionQuery.data;
  if (!executionData) {
    return (
      <PageContainer>
        <PageHeader title="Execution not found" />
      </PageContainer>
    );
  }

  const decoratedNodes = executionData.steps.map((node: any) => ({
    ...node,
    data: {
      ...node.data,
      status: execution.nodeStatus[node.id] ?? 'idle',
      output: execution.variables[node.id],
    },
  }));

  const decoratedEdges = executionData.steps.flatMap(step =>
    (step.nextSteps ?? []).map(targetId => {
      const edgeId = `${step.id}->${targetId}`;
      return {
        id: edgeId,
        source: step.id,
        target: targetId,
        type: 'bezier',
        data: {
          status: execution.edgeStatus[edgeId] ?? 'idle',
          animated: execution.edgeStatus[edgeId] === 'running',
        },
      };
    })
  );

  const completedCount = Object.values(execution.nodeStatus).filter(s => s === 'success').length;
  const failedCount = Object.values(execution.nodeStatus).filter(s => s === 'error').length;

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Workflow Execution"
        description={`Execution ${executionId?.slice(0, 8)}`}
        breadcrumbs={[
          { label: 'Workflows', href: '/workflows' },
          { label: workflowId!.slice(0, 8), href: `/workflows/${workflowId}` },
          { label: 'Execution' },
        ]}
      />

      <div className="flex items-center justify-end gap-2">
        <StatusBadge status={execution.status as any} />
        <WorkflowRunControls
          status={execution.status as RunStatus}
          onPause={() => toast({ title: 'Pause is unavailable' })}
          onResume={() => toast({ title: 'Resume is unavailable' })}
          onStop={() => toast({ title: 'Stop is unavailable' })}
          onRetry={() => toast({ title: 'Retry is unavailable' })}
          pauseLoading={false}
          resumeLoading={false}
          stopLoading={false}
          retryLoading={false}
        />
      </div>

      <ExecutionMetrics
        durationMs={execution.durationMs}
        tokensUsed={execution.tokensUsed}
        costUsd={execution.costUsd}
        nodeCount={decoratedNodes.length}
        completedCount={completedCount}
        failedCount={failedCount}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_400px]">
        <div className="h-[600px] overflow-hidden rounded-lg border border-border bg-background">
          <WorkflowCanvas
            withProvider={false}
            nodes={decoratedNodes}
            edges={decoratedEdges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <CanvasBackground />
            <CanvasControls />
          </WorkflowCanvas>
        </div>

        <div className="space-y-4">
          <ExecutionTimeline events={execution.events} />
          <ExecutionLogPanel logs={execution.logs} autoScroll maxHeight={360} />
        </div>
      </div>
    </PageContainer>
  );
}
