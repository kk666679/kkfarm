'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReactFlow, useViewport } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  CanvasProvider,
  CanvasBackground,
  CanvasControls,
  WorkflowCanvas,
  NodePalette,
  NodeInspector,
  Toolbar,
  ValidationPanel,
  nodeTypes,
  edgeTypes,
  useWorkflowStore,
  useNodeDrop,
  useWorkflowValidation,
  useUndoRedo,
  useAutoLayout,
} from '@/components/workflows';
import { trpc } from '@/trpc/client';
import { useToast } from '@/components/ui/toaster';

export default function WorkflowBuilderPage() {
  return (
    <CanvasProvider>
      <WorkflowBuilderInner />
    </CanvasProvider>
  );
}

function WorkflowBuilderInner() {
  const { workflowId } = useParams<{ workflowId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fitView } = useReactFlow();
  const { zoom } = useViewport();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    updateNodeData,
    deleteNode,
    setSelectedNode,
    setWorkflow,
  } = useWorkflowStore();

  const { onDrop, onDragOver } = useNodeDrop();
  const { errors, warnings } = useWorkflowValidation(nodes, edges);
  const { onUndo, onRedo, canUndo, canRedo } = useUndoRedo();
  const { layout } = useAutoLayout();

  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [isSaving, setIsSaving] = useState(false);

  const workflowQuery = trpc.workflow.byId.useQuery(
    { workflowId: workflowId! },
    { enabled: !!workflowId && workflowId !== 'new' }
  );

  useEffect(() => {
    if (!workflowQuery.data) return;
    setWorkflowName(workflowQuery.data.name);
    setWorkflow(workflowQuery.data.nodes, workflowQuery.data.edges);
    requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
  }, [workflowQuery.data, setWorkflow, fitView]);

  const saveMutation = trpc.workflow.save.useMutation({
    onSuccess: ({ workflowId: newId }) => {
      toast({ title: 'Workflow saved' });
      setIsSaving(false);
      if (newId && newId !== workflowId) {
        navigate(`/workflows/${newId}/builder`, { replace: true });
      }
    },
    onError: e => {
      setIsSaving(false);
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    },
  });

  const handleSave = useCallback(() => {
    if (errors.length > 0) {
      toast({
        title: 'Cannot save',
        description: `${errors.length} validation error(s) must be fixed first.`,
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    saveMutation.mutate({ id: workflowId, name: workflowName, nodes, edges });
  }, [errors.length, workflowName, nodes, edges, workflowId, saveMutation, toast]);

  const handleTest = useCallback(() => {
    if (errors.length > 0) {
      toast({
        title: 'Cannot run',
        description: 'Fix validation errors first.',
        variant: 'destructive',
      });
      return;
    }
    sessionStorage.setItem(
      'workflow-builder:test-draft',
      JSON.stringify({ name: workflowName, nodes, edges })
    );
    navigate('/workflows/test/run');
  }, [errors.length, workflowName, nodes, edges, navigate, toast]);

  const handleReset = useCallback(() => {
    setWorkflow([], []);
    setWorkflowName('New Workflow');
  }, [setWorkflow]);

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className="w-64 shrink-0 overflow-y-auto border-r border-border bg-muted/30 p-4"
        aria-label="Node palette"
      >
        <NodePalette />
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <Toolbar
          workflowName={workflowName}
          onWorkflowNameChange={setWorkflowName}
          zoom={zoom}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          onReset={handleReset}
          onTest={handleTest}
          onSave={handleSave}
          onAutoLayout={() => layout('TB')}
          isSaving={isSaving}
          errorCount={errors.length}
        />

        <div className="relative flex-1 overflow-hidden" onDrop={onDrop} onDragOver={onDragOver}>
          <WorkflowCanvas
            withProvider={false}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            className="workflow-canvas"
          >
            <CanvasBackground />
            <CanvasControls />
            {errors.length + warnings.length > 0 && (
              <div className="pointer-events-none absolute right-4 top-4 z-10">
                <ValidationPanel errors={errors} warnings={warnings} />
              </div>
            )}
          </WorkflowCanvas>
        </div>
      </main>

      <aside
        className="w-80 shrink-0 overflow-y-auto border-l border-border bg-muted/30 p-4"
        aria-label="Node inspector"
      >
        <NodeInspector
          selectedNode={selectedNode}
          onUpdateData={updateNodeData}
          onDelete={deleteNode}
        />
      </aside>
    </div>
  );
}
