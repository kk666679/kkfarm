'use client';
import {
  Save,
  Play,
  Undo2,
  Redo2,
  RotateCcw,
  LayoutGrid,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export interface ToolbarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onTest: () => void;
  onSave: () => void;
  onAutoLayout: () => void;
  isSaving?: boolean;
  errorCount?: number;
}

export function Toolbar({
  workflowName,
  onWorkflowNameChange,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onTest,
  onSave,
  onAutoLayout,
  isSaving = false,
  errorCount = 0,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
      <Input
        value={workflowName}
        onChange={e => onWorkflowNameChange(e.target.value)}
        className="h-8 max-w-xs text-sm font-medium"
        aria-label="Workflow name"
      />
      <Badge variant="outline" className="text-[10px]">
        {Math.round(zoom * 100)}%
      </Badge>
      {errorCount > 0 && (
        <Badge variant="destructive" className="text-[10px]">
          <AlertCircle className="mr-1 h-3 w-3" />
          {errorCount}
        </Badge>
      )}
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Undo" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Redo" onClick={onRedo} disabled={!canRedo}>
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Auto layout" onClick={onAutoLayout}>
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Reset" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="mx-1 h-6 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={onTest}>
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Test
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-3.5 w-3.5" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
}
