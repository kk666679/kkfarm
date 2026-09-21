'use client';
import { useState } from 'react';
import type { Edge } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { EmptyState } from '../../shared/EmptyState';

export interface EdgeEditorProps {
  edge: Edge | null;
  onUpdate: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

export function EdgeEditor({ edge, onUpdate, onDelete }: EdgeEditorProps) {
  const [label, setLabel] = useState((edge?.data?.label as string | undefined) ?? '');
  const [condition, setCondition] = useState((edge?.data?.condition as string | undefined) ?? '');

  if (!edge) {
    return (
      <EmptyState title="No edge selected" description="Click an edge on the canvas to edit it." />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">Edge Editor</p>
          <p className="text-[10px] text-muted-foreground">{edge.id.slice(0, 8)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete edge"
          onClick={() => onDelete(edge.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-1">
        <Label htmlFor="edge-label" className="text-xs">
          Label
        </Label>
        <Input
          id="edge-label"
          value={label}
          onChange={e => {
            setLabel(e.target.value);
            onUpdate(edge.id, { data: { ...edge.data, label: e.target.value } });
          }}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="edge-condition" className="text-xs">
          Condition
        </Label>
        <Input
          id="edge-condition"
          value={condition}
          onChange={e => {
            setCondition(e.target.value);
            onUpdate(edge.id, { data: { ...edge.data, condition: e.target.value } });
          }}
        />
      </div>
    </div>
  );
}
