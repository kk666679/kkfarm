'use client';
import { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider, Background, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Minus, Pencil, GitCompare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { nodeTypes } from '@/components/workflows';
import { edgeTypes } from '@/components/workflows';

export interface VersionDiff {
  nodesAdded: Node[];
  nodesRemoved: Node[];
  nodesModified: Array<{ before: Node; after: Node }>;
  edgesAdded: Edge[];
  edgesRemoved: Edge[];
  edgesModified: Array<{ before: Edge; after: Edge }>;
}

export interface WorkflowVersionDiffProps {
  diff?: VersionDiff;
  loading?: boolean;
}

export function WorkflowVersionDiff({ diff, loading }: WorkflowVersionDiffProps) {
  const summary = useMemo(() => summarize(diff), [diff]);

  if (loading) {
    return <div className="h-[500px] animate-pulse rounded-lg border border-border bg-card" />;
  }

  if (!diff) {
    return (
      <Card className="flex h-[500px] flex-col items-center justify-center gap-2 border-border bg-card p-8 text-center">
        <GitCompare className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">Select two versions to compare</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Click a version to set it as <strong>base</strong>, then click another to set it as{' '}
          <strong>compare</strong>.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={Plus} label="Added" value={summary.added} tone="success" />
        <Stat icon={Minus} label="Removed" value={summary.removed} tone="error" />
        <Stat icon={Pencil} label="Modified" value={summary.modified} tone="warning" />
        <Stat
          icon={GitCompare}
          label="Total"
          value={summary.added + summary.removed + summary.modified}
          tone="neutral"
        />
      </div>

      <ReactFlowProvider>
        <div className="h-[500px] overflow-hidden rounded-lg border border-border bg-background">
          <ReactFlow
            nodes={decorateNodes(diff)}
            edges={decorateEdges(diff)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Plus;
  label: string;
  value: number;
  tone: 'success' | 'error' | 'warning' | 'neutral';
}) {
  const toneClass = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    neutral: 'text-muted-foreground',
  }[tone];

  return (
    <Card className="flex items-center gap-3 border-border bg-card p-3">
      <Icon className={`h-4 w-4 ${toneClass}`} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
      </div>
    </Card>
  );
}

function decorateNodes(diff: VersionDiff): Node[] {
  return [
    ...diff.nodesAdded.map(n => ({ ...n, data: { ...n.data, _diff: 'added' } })),
    ...diff.nodesRemoved.map(n => ({ ...n, data: { ...n.data, _diff: 'removed' } })),
    ...diff.nodesModified.map(({ after }) => ({
      ...after,
      data: { ...after.data, _diff: 'modified' },
    })),
  ];
}

function decorateEdges(diff: VersionDiff): Edge[] {
  return [
    ...diff.edgesAdded.map(e => ({ ...e, data: { ...e.data, _diff: 'added' }, animated: true })),
    ...diff.edgesRemoved.map(e => ({
      ...e,
      data: { ...e.data, _diff: 'removed' },
      animated: true,
    })),
    ...diff.edgesModified.map(({ after }) => ({
      ...after,
      data: { ...after.data, _diff: 'modified' },
      animated: true,
    })),
  ];
}

function summarize(diff?: VersionDiff) {
  if (!diff) return { added: 0, removed: 0, modified: 0 };
  return {
    added: diff.nodesAdded.length + diff.edgesAdded.length,
    removed: diff.nodesRemoved.length + diff.edgesRemoved.length,
    modified: diff.nodesModified.length + diff.edgesModified.length,
  };
}
