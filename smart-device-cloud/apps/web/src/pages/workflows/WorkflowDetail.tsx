'use client';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Pencil, Copy, Trash2, Maximize2 } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import type { WorkflowStatus } from '@smart-device-cloud/shared';
import {
  CanvasProvider,
  WorkflowCanvas,
  CanvasBackground,
  CanvasControls,
  nodeTypes,
  edgeTypes,
  EmptyState,
  ExecutionHistoryTable,
  WorkflowMetadata,
} from '@/components/workflows';
import { trpc } from '@/trpc/client';
import { useToast } from '@/components/ui/toaster';

export default function WorkflowDetailPage() {
  return (
    <CanvasProvider>
      <WorkflowDetailInner />
    </CanvasProvider>
  );
}

function WorkflowDetailInner() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const query = trpc.workflow.byId.useQuery({ workflowId: workflowId! }, { enabled: !!workflowId });

  const runMutation = trpc.workflow.run.useMutation({
    onSuccess: ({ executionId }) => {
      toast({ title: 'Workflow started' });
      navigate(`/workflows/${workflowId}/run/${executionId}`);
    },
    onError: e => toast({ title: 'Run failed', description: e.message, variant: 'destructive' }),
  });

  const duplicateMutation = trpc.workflow.duplicate.useMutation({
    onSuccess: ({ workflowId: newId }) => navigate(`/workflows/${newId}/builder`),
  });

  const deleteMutation = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Workflow deleted' });
      navigate('/workflows');
    },
  });

  if (query.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Workflow" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-[500px] w-full" />
      </PageContainer>
    );
  }

  if (query.isError) {
    return (
      <PageContainer>
        <PageHeader title="Workflow" />
        <EmptyState title="Failed to load workflow" description={query.error.message} />
      </PageContainer>
    );
  }

  const workflow = query.data;
  if (!workflow) {
    return (
      <PageContainer>
        <PageHeader title="Workflow not found" />
        <EmptyState
          title="Not found"
          action={{ label: 'Back to workflows', onClick: () => navigate('/workflows') }}
        />
      </PageContainer>
    );
  }

  const statusVariantMap = {
    active: 'default',
    draft: 'secondary',
    archived: 'outline',
    paused: 'outline',
    disabled: 'outline',
    running: 'default',
    completed: 'secondary',
    failed: 'destructive',
    cancelled: 'outline',
  } as const satisfies Record<WorkflowStatus, 'default' | 'secondary' | 'destructive' | 'outline'>;

  const statusVariant = statusVariantMap[workflow.status];

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title={workflow.name}
        description={workflow.description}
        breadcrumbs={[{ label: 'Workflows', href: '/workflows' }, { label: workflow.name }]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant} className="capitalize">
              {workflow.status}
            </Badge>
            <Button
              onClick={() => runMutation.mutate({ workflowId: workflow.id })}
              disabled={runMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Run
            </Button>
            <Button variant="outline" onClick={() => navigate(`/workflows/${workflow.id}/builder`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Duplicate"
              onClick={() => duplicateMutation.mutate({ workflowId: workflow.id })}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Delete"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="canvas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="canvas" className="m-0">
          <ReadOnlyCanvas nodes={workflow.nodes as any} edges={workflow.edges as any} />
        </TabsContent>

        <TabsContent value="executions" className="m-0">
          <ExecutionHistoryTable workflowId={workflow.id} />
        </TabsContent>

        <TabsContent value="details" className="m-0">
          <WorkflowMetadata workflow={workflow} />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete workflow?"
        description={`"${workflow.name}" and all its execution history will be permanently removed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteMutation.mutate({ workflowId: workflow.id })}
        onCancel={() => setConfirmDelete(false)}
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}

function ReadOnlyCanvas({ nodes, edges }: { nodes: any[]; edges: any[] }) {
  const { fitView } = useReactFlow();
  if (nodes.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border border-border bg-card">
        <EmptyState title="Empty workflow" description="This workflow has no nodes yet." />
      </div>
    );
  }
  return (
    <div className="relative h-[500px] overflow-hidden rounded-lg border border-border bg-background">
      <Button
        variant="outline"
        size="icon"
        className="absolute right-3 top-3 z-10"
        aria-label="Fit view"
        onClick={() => fitView({ duration: 200 })}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <WorkflowCanvas
        withProvider={false}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <CanvasBackground />
        <CanvasControls />
      </WorkflowCanvas>
    </div>
  );
}
