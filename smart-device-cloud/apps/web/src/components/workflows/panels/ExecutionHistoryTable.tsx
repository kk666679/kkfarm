'use client';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '../shared/EmptyState';
import { trpc } from '@/trpc/client';

export function ExecutionHistoryTable({ workflowId }: { workflowId: string }) {
  const navigate = useNavigate();
  const query = trpc.workflow.executions.useQuery({ workflowId, limit: 20 });

  if (query.isLoading) return <Skeleton className="h-64 w-full" />;
  if (query.isError) return <p className="text-sm text-destructive">{query.error.message}</p>;

  const executions = query.data?.executions ?? [];
  if (executions.length === 0) {
    return <EmptyState title="No executions yet" description="Run this workflow to see history." />;
  }

  return (
    <div className="space-y-2">
      {executions.map(execution => (
        <div
          key={execution.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{execution.id.slice(0, 8)}</span>
              <Badge variant="outline" className="capitalize text-[10px]">
                {execution.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(execution.startedAt).toLocaleString()}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/workflows/${workflowId}/run/${execution.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
