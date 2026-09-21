'use client';
import { RotateCcw, Trash2, Clock, User as UserIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface WorkflowVersion {
  id: string;
  number: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  status: 'active' | 'inactive' | 'archived';
  message: string;
  nodeCount: number;
  edgeCount: number;
}

export interface WorkflowVersionRowProps {
  version: WorkflowVersion;
  isActive: boolean;
  isSelected: boolean;
  isBase: boolean;
  isCompare: boolean;
  onSelect: () => void;
  onRestore: () => void;
  onDelete: () => void;
}

export function WorkflowVersionRow({
  version,
  isActive,
  isSelected,
  isBase,
  isCompare,
  onSelect,
  onRestore,
  onDelete,
}: WorkflowVersionRowProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Version ${version.number}`}
      onClick={onSelect}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'cursor-pointer border-border bg-card p-4 transition-colors hover:bg-accent/50',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">v{version.number}</span>
            {isActive && <Badge variant="default">active</Badge>}
            {isBase && <Badge variant="outline">base</Badge>}
            {isCompare && <Badge variant="outline">compare</Badge>}
          </div>
          <p className="line-clamp-2 text-xs text-muted-foreground">{version.message}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(version.createdAt).toLocaleDateString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              {version.createdBy.name}
            </span>
            <span>
              {version.nodeCount} nodes · {version.edgeCount} edges
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
          {!isActive && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Restore v${version.number}`}
              onClick={onRestore}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {!isActive && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete v${version.number}`}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
