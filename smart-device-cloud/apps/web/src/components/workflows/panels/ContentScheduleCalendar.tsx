'use client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScheduledSlot } from '../types';

export interface ContentScheduleCalendarProps {
  slots: ScheduledSlot[];
  onSlotClick?: (slot: ScheduledSlot) => void;
}

export function ContentScheduleCalendar({ slots, onSlotClick }: ContentScheduleCalendarProps) {
  const sorted = [...slots].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );
  return (
    <Card className="border-border bg-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold">Scheduled Posts</span>
        <Badge variant="secondary" className="text-[10px]">
          {slots.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">No scheduled posts</p>
        ) : (
          sorted.map(slot => (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSlotClick?.(slot)}
              className={cn(
                'flex w-full items-start gap-2 rounded-md border border-border bg-muted/20 p-2 text-left transition-colors hover:bg-accent/50',
                slot.optimal && 'border-fuchsia-500/40 bg-fuchsia-500/5'
              )}
            >
              <Clock className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium">
                    {new Date(slot.scheduledAt).toLocaleString()}
                  </span>
                  {slot.optimal && <Zap className="h-3 w-3 text-fuchsia-500" />}
                </div>
                <p className="truncate text-[10px] text-muted-foreground">{slot.label}</p>
                <div className="mt-1 flex items-center gap-1">
                  <Badge variant="outline" className="text-[9px] capitalize">
                    {slot.platform}
                  </Badge>
                  {slot.status && (
                    <Badge
                      variant={
                        slot.status === 'published'
                          ? 'secondary'
                          : slot.status === 'failed'
                            ? 'destructive'
                            : 'outline'
                      }
                      className="text-[9px]"
                    >
                      {slot.status}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
