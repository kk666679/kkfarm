'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '../shared/EmptyState';
import { cn } from '@/lib/utils';
import type { StackFrame } from '../types';

export interface VariableInspectorProps {
  variables: Record<string, unknown>;
  callStack: StackFrame[];
}

export function VariableInspector({ variables, callStack }: VariableInspectorProps) {
  if (Object.keys(variables).length === 0 && callStack.length === 0) {
    return (
      <Card className="border-border bg-card p-4">
        <EmptyState title="No variables" description="Variables appear when execution pauses." />
      </Card>
    );
  }
  return (
    <Card className="space-y-4 border-border bg-card p-3">
      {callStack.length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Call Stack
          </h4>
          <div className="space-y-1">
            {callStack.map((frame, i) => (
              <div key={i} className="rounded bg-muted/50 px-2 py-1 text-[11px]">
                <span className="font-medium">{frame.function}</span>
                <span className="ml-2 text-muted-foreground">line {frame.line}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {Object.keys(variables).length > 0 && (
        <section>
          <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Variables
          </h4>
          <div className="space-y-0.5">
            {Object.entries(variables).map(([key, value]) => (
              <ValueTree key={key} value={value} name={key} />
            ))}
          </div>
        </section>
      )}
    </Card>
  );
}

function ValueTree({ value, name, depth = 0 }: { value: unknown; name?: string; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  if (value === null || value === undefined)
    return <span className="text-[11px] text-muted-foreground">{String(value)}</span>;
  if (typeof value !== 'object') {
    return (
      <span
        className={cn(
          'text-[11px]',
          typeof value === 'number' && 'text-blue-500',
          typeof value === 'boolean' && 'text-violet-500'
        )}
      >
        {JSON.stringify(value)}
      </span>
    );
  }
  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, unknown>);
  return (
    <div className="pl-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 text-[11px] hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {name && <span className="font-medium">{name}:</span>}
        <span className="text-muted-foreground">
          {Array.isArray(value) ? `Array(${value.length})` : `Object(${entries.length})`}
        </span>
      </button>
      {open && (
        <div className="ml-3 border-l border-border pl-2">
          {entries.map(([k, v]) => (
            <div key={k} className="py-0.5">
              <ValueTree value={v} name={k} depth={depth + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
