'use client';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/workflows';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { WorkflowKpiStrip } from '@/components/workflows/WorkflowKpiStrip';
import { WorkflowListCard } from '@/components/workflows/WorkflowListCard';
import { WorkflowFilters, type StatusFilter } from '@/components/workflows/WorkflowFilters';
import { trpc } from '@/trpc/client';
import { useRealtime } from '@/hooks/useRealtime';
import { useToast } from '@/components/ui/toaster';

export default function WorkflowListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);

  const workflowsQuery = trpc.workflow.list.useQuery({ limit: 100 });

  useRealtime({
    channel: 'workflow:list',
    onMessage: event => {
      if (event.type.startsWith('workflow.')) utils.workflow.list.invalidate();
    },
  });

  const runMutation = trpc.workflow.run.useMutation({
    onSuccess: ({ executionId, workflowId }) => {
      setRunningId(null);
      navigate(`/workflows/${workflowId}/run/${executionId}`);
    },
    onError: e => {
      setRunningId(null);
      toast({ title: 'Run failed', description: e.message, variant: 'destructive' });
    },
  });

  const duplicateMutation = trpc.workflow.duplicate.useMutation({
    onSuccess: ({ workflowId }) => {
      toast({ title: 'Workflow duplicated' });
      utils.workflow.list.invalidate();
      navigate(`/workflows/${workflowId}/builder`);
    },
  });

  const deleteMutation = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Workflow deleted' });
      utils.workflow.list.invalidate();
      setConfirmDelete(null);
    },
  });

  const filtered = useMemo(() => {
    const all = workflowsQuery.data?.workflows ?? [];
    const q = search.trim().toLowerCase();
    return all
      .filter(w => statusFilter === 'all' || w.status === statusFilter)
      .filter(
        w => !q || w.name.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q)
      );
  }, [workflowsQuery.data, search, statusFilter]);

  const kpis = useMemo(() => {
    const all = workflowsQuery.data?.workflows ?? [];
    const active = all.filter(w => w.status === 'active').length;
    const totalRuns = all.reduce((sum, w) => sum + (w.runCount ?? 0), 0);
    const successRate =
      all.length > 0 ? all.reduce((sum, w) => sum + (w.successRate ?? 100), 0) / all.length : 100;
    return { total: all.length, active, totalRuns, successRate };
  }, [workflowsQuery.data]);

  const handleRun = (workflow: { id: string }) => {
    setRunningId(workflow.id);
    runMutation.mutate({ workflowId: workflow.id });
  };

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Workflows"
        description={`${workflowsQuery.data?.workflows.length ?? 0} workflows`}
        breadcrumbs={[{ label: 'Workflows' }]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/workflows/builder/new')}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Workflow
          </button>
        }
      />

      <WorkflowKpiStrip {...kpis} />

      <WorkflowFilters
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {workflowsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : workflowsQuery.isError ? (
        <EmptyState title="Failed to load workflows" description={workflowsQuery.error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== 'all' ? 'No matches' : 'No workflows yet'}
          description={
            search || statusFilter !== 'all'
              ? 'Try a different search term or status.'
              : 'Create your first workflow to automate device operations.'
          }
          action={{ label: 'Create Workflow', onClick: () => navigate('/workflows/builder/new') }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(workflow => (
            <WorkflowListCard
              key={workflow.id}
              workflow={workflow}
              running={runningId === workflow.id}
              onOpen={() => navigate(`/workflows/${workflow.id}`)}
              onEdit={() => navigate(`/workflows/${workflow.id}/builder`)}
              onRun={() => handleRun(workflow)}
              onHistory={() => navigate(`/workflows/${workflow.id}/executions`)}
              onDuplicate={() => duplicateMutation.mutate({ workflowId: workflow.id })}
              onDelete={() => setConfirmDelete({ id: workflow.id, name: workflow.name })}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete workflow?"
        description={
          confirmDelete
            ? `"${confirmDelete.name}" and all its execution history will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => confirmDelete && deleteMutation.mutate({ workflowId: confirmDelete.id })}
        onCancel={() => setConfirmDelete(null)}
        loading={deleteMutation.isPending}
      />
    </PageContainer>
  );
}
