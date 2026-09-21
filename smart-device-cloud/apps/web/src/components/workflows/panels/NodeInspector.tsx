'use client';
import { Trash2 } from 'lucide-react';
import type { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '../shared/EmptyState';

export interface NodeInspectorProps {
  selectedNode: Node | null;
  onUpdateData: (id: string, patch: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

export function NodeInspector({ selectedNode, onUpdateData, onDelete }: NodeInspectorProps) {
  if (!selectedNode) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Inspector</h3>
        <EmptyState title="Nothing selected" description="Click a node on the canvas to edit it." />
      </div>
    );
  }

  const data = selectedNode.data as Record<string, unknown>;
  const label = typeof data.label === 'string' ? data.label : '';
  const config = (data.config as Record<string, unknown> | undefined) ?? {};

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{label || 'Untitled'}</h3>
          <p className="text-[10px] text-muted-foreground">
            {selectedNode.type ?? 'node'} · {selectedNode.id.slice(0, 8)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete node"
          onClick={() => onDelete(selectedNode.id)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="node-label" className="text-xs font-medium">
            Label
          </label>
          <Input
            id="node-label"
            value={label}
            onChange={e => onUpdateData(selectedNode.id, { label: e.target.value })}
          />
        </div>
        {Object.keys(config).length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium">Config</p>
              {Object.entries(config).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <label
                    htmlFor={`config-${key}`}
                    className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {key}
                  </label>
                  <Input
                    id={`config-${key}`}
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    onChange={e =>
                      onUpdateData(selectedNode.id, {
                        config: { ...config, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
