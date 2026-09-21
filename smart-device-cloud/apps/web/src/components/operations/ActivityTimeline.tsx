import { useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Cpu,
  PlayCircle,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SurfaceTimelineEvent } from '@/types/agent-surface';

interface ActivityTimelineProps {
  events: SurfaceTimelineEvent[];
  emptyMessage?: string;
  className?: string;
}

const KIND_ICON: Record<string, LucideIcon> = {
  'device.connected': CircleDot,
  'device.disconnected': XCircle,
  'task.started': PlayCircle,
  'task.failed': AlertTriangle,
  'task.completed': CheckCircle2,
  'workflow.started': PlayCircle,
  'workflow.completed': CheckCircle2,
  'workflow.failed': AlertTriangle,
  'agent.started': Cpu,
  'agent.completed': CheckCircle2,
  'agent.failed': XCircle,
  'approval.requested': ShieldCheck,
  'approval.granted': ShieldCheck,
  'approval.rejected': XCircle,
};

function iconFor(kind: string): LucideIcon {
  return KIND_ICON[kind] ?? Activity;
}

function severityClass(kind: string): string {
  if (kind.includes('failed') || kind.includes('rejected') || kind.includes('disconnected'))
    return 'text-destructive';
  if (kind.includes('completed') || kind.includes('granted') || kind.includes('connected'))
    return 'text-emerald-600 dark:text-emerald-400';
  if (kind.includes('requested') || kind.includes('started'))
    return 'text-primary';
  return 'text-muted-foreground';
}

function actorIcon(actor?: SurfaceTimelineEvent['actor']) {
  if (actor === 'agent') return Cpu;
  if (actor === 'user') return User;
  return CircleDot;
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function ActivityTimeline({
  events,
  emptyMessage = 'No activity yet.',
  className,
}: ActivityTimelineProps) {
  const sorted = useMemo(
    () => [...events].sort((a, b) => b.at.localeCompare(a.at)),
    [events]
  );

  if (sorted.length === 0) {
    return (
      <div
        className={cn(
          'rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground',
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <ol role="list" className={cn('relative space-y-1', className)}>
      <div className="absolute bottom-2 left-[15px] top-2 w-px bg-border" aria-hidden="true" />
      {sorted.map(ev => {
        const Icon = iconFor(ev.kind);
        const ActorIcon = actorIcon(ev.actor);
        return (
          <li key={ev.id} className="relative flex gap-3 py-1.5">
            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card',
                severityClass(ev.kind)
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-foreground">{ev.summary}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatTime(ev.at)}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ActorIcon className="h-3 w-3" aria-hidden="true" />
                  {ev.actor ?? 'system'}
                </span>
                <span className="rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px]">
                  {ev.kind}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
