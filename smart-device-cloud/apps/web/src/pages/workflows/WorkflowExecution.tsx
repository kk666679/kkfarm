'use client';
import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/workflows';
import { WorkflowExecutionRow } from '@/components/workflows/WorkflowExecutionRow';
import { trpc } from '@/trpc/client';
import { useRealtime } from '@/hooks/useRealtime';

const STATUS_FILTERS = ['all', 'running', 'completed', 'failed'] as const;

export default function WorkflowExecutionPage() {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const query = trpc.workflow.executions.useQuery(
    { workflowId: workflowId!, limit: 50 },
    { enabled: !!workflowId }
  );

  useRealtime({
    channel: `workflow:executions:${workflowId}`,
    enabled: !!workflowId,
    onMessage: () => utils.workflow.executions.invalidate({ workflowId: workflowId! }),
  });

  const rerunMutation = trpc.workflow.run.useMutation({
    onSuccess: ({ executionId }) => {
      utils.workflow.executions.invalidate({ workflowId: workflowId! });
      navigate(`/workflows/${workflowId}/run/${executionId}`);
    },
  });

  const filtered = useMemo(() => {
    const all = query.data?.executions ?? [];
    return statusFilter === 'all' ? all : all.filter((e: any) => e.status === statusFilter);
  }, [query.data, statusFilter]);

  if (query.isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Execution History" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-4">
      <PageHeader
        title="Execution History"
        description="Past executions of this workflow"
        breadcrumbs={[
          { label: 'Workflows', href: '/workflows' },
          { label: workflowId!.slice(0, 8), href: `/workflows/${workflowId}` },
          { label: 'Executions' },
        ]}
        actions={
          <Button
            onClick={() => rerunMutation.mutate({ workflowId: workflowId! })}
            disabled={rerunMutation.isPending}
          >
            <Play className="mr-2 h-4 w-4" />
            Run again
          </Button>
        }
      />

      <div role="tablist" aria-label="Status filter" className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(s => (
          <Button
            key={s}
            role="tab"
            aria-selected={statusFilter === s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(s)}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={statusFilter === 'all' ? 'No executions yet' : `No ${statusFilter} executions`}
          description={
            statusFilter === 'all'
              ? 'Run this workflow to see history here.'
              : 'Try a different status filter.'
          }
          action={{
            label: 'Run workflow',
            onClick: () => rerunMutation.mutate({ workflowId: workflowId! }),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((execution: any) => (
            <WorkflowExecutionRow
              key={execution.id}
              execution={execution}
              onView={() => navigate(`/workflows/${workflowId}/run/${execution.id}`)}
              onRerun={() => rerunMutation.mutate({ workflowId: workflowId! })}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
