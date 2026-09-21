'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User as UserIcon } from 'lucide-react';

export interface WorkflowMetadataProps {
  workflow: {
    id: string;
    name: string;
    description?: string;
    status: string;
    version?: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: { id: string; name: string } | null;
    nodeCount?: number;
    edgeCount?: number;
    runCount?: number;
  };
}

export function WorkflowMetadata({ workflow }: WorkflowMetadataProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card className="space-y-3 border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Details</h3>
        <Row label="ID" value={workflow.id} mono />
        <Row
          label="Status"
          value={
            <Badge variant="outline" className="capitalize">
              {workflow.status}
            </Badge>
          }
        />
        <Row label="Version" value={workflow.version ?? '1.0.0'} />
        <Row label="Nodes" value={String(workflow.nodeCount ?? 0)} />
        <Row label="Edges" value={String(workflow.edgeCount ?? 0)} />
        <Row label="Runs" value={String(workflow.runCount ?? 0)} />
      </Card>
      <Card className="space-y-3 border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Timeline</h3>
        <Row
          label="Created"
          value={
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(workflow.createdAt).toLocaleString()}
            </span>
          }
        />
        <Row
          label="Updated"
          value={
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(workflow.updatedAt).toLocaleString()}
            </span>
          }
        />
        {workflow.createdBy && (
          <Row
            label="Created by"
            value={
              <span className="inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {workflow.createdBy.name}
              </span>
            }
          />
        )}
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? 'font-mono' : 'font-medium'}>{value}</span>
    </div>
  );
}
