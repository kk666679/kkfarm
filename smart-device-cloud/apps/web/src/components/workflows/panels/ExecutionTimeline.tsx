'use client';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TimelineEvent } from '../types';

export interface ExecutionTimelineProps {
  events: TimelineEvent[];
}

export function ExecutionTimeline({ events }: ExecutionTimelineProps) {
  return (
    <Card className="flex flex-col border-border bg-card">
      <div className="border-b border-border px-3 py-2">
        <span className="text-xs font-semibold">Timeline</span>
      </div>
      <div className="max-h-[300px] space-y-2 overflow-y-auto p-3">
        {events.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No events yet</p>
        ) : (
          events.map((event, i) => (
            <div key={i} className="flex gap-2 text-[11px]">
              <span
                className={cn(
                  'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                  event.type.startsWith('node.completed') && 'bg-emerald-500',
                  event.type.startsWith('node.failed') && 'bg-destructive',
                  event.type.startsWith('node.started') && 'bg-primary',
                  !event.type.startsWith('node') && 'bg-muted-foreground'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{event.type}</p>
                <p className="text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
