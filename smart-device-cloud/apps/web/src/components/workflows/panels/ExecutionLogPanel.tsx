'use client';
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LogEntry } from '../types';

export interface ExecutionLogPanelProps {
  logs: LogEntry[];
  autoScroll?: boolean;
  maxHeight?: number;
}

export function ExecutionLogPanel({
  logs,
  autoScroll = true,
  maxHeight = 400,
}: ExecutionLogPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoScroll && endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length, autoScroll]);

  return (
    <Card className="flex flex-col border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold">Logs</span>
        <Badge variant="secondary" className="text-[10px]">
          {logs.length}
        </Badge>
      </div>
      <div className="space-y-1 overflow-y-auto p-2 font-mono text-[11px]" style={{ maxHeight }}>
        {logs.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">No logs yet</p>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-2 rounded px-2 py-1',
                log.level === 'error' && 'bg-destructive/10 text-destructive',
                log.level === 'warn' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              )}
            >
              <span className="shrink-0 text-muted-foreground">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="break-all">{log.message}</span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </Card>
  );
}
