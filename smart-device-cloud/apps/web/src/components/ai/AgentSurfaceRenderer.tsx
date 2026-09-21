import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApprovalPanel } from '@/components/operations/ApprovalPanel';
import { ActivityTimeline } from '@/components/operations/ActivityTimeline';
import { EvidencePanel } from '@/components/operations/EvidencePanel';
import type { AgentSurface } from '@/types/agent-surface';

interface AgentSurfaceRendererProps {
  surface: AgentSurface;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
}

/**
 * AgentSurfaceRenderer — the ONLY place AI output becomes React.
 *
 * Security invariant: never eval, never dangerouslySetInnerHTML.
 * Every `kind` maps to a fixed component. Unknown kinds fall through to
 * UnknownSurface, which renders text.
 */
export function AgentSurfaceRenderer({
  surface,
  onApprove,
  onReject,
}: AgentSurfaceRendererProps) {
  switch (surface.kind) {
    case 'text':
      return (
        <div className="space-y-3">
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {surface.markdown}
          </div>
          {surface.sources && surface.sources.length > 0 && (
            <SourcesBlock sources={surface.sources} />
          )}
        </div>
      );

    case 'device-list':
    case 'device-grid':
    case 'device-detail':
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          {surface.caption ??
            (surface.kind === 'device-detail'
              ? `Device ${surface.deviceId}`
              : surface.kind === 'device-grid'
                ? `${surface.deviceIds.length} devices`
                : 'Filtered devices')}
          <div className="mt-1 text-xs text-muted-foreground/70">
            Renderer pending Phase 3 wiring.
          </div>
        </div>
      );

    case 'plan':
      return (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-3 py-2 text-sm font-semibold text-foreground">
            {surface.title}
          </div>
          <ol role="list" className="divide-y divide-border">
            {surface.steps.map((s, i) => (
              <li key={s.id} className="flex gap-3 px-3 py-2 text-sm">
                <span className="tabular-nums text-muted-foreground">{i + 1}.</span>
                <div className="min-w-0">
                  <div className="text-foreground">{s.label}</div>
                  {s.description && (
                    <div className="text-xs text-muted-foreground">{s.description}</div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      );

    case 'approval':
      return (
        <ApprovalPanel
          proposal={surface.proposal}
          onApprove={onApprove ? () => onApprove(surface.proposal.id) : undefined}
          onReject={onReject ? () => onReject(surface.proposal.id) : undefined}
        />
      );

    case 'timeline':
      return (
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-3 py-2 text-sm font-semibold text-foreground">
            {surface.title ?? 'Timeline'}
          </div>
          <div className="p-3">
            <ActivityTimeline events={surface.events} />
          </div>
        </div>
      );

    case 'evidence':
      return (
        <EvidencePanel
          chainId={surface.chainId}
          entries={[]}
          title={surface.caption ?? 'Evidence'}
        />
      );

    case 'alert': {
      const tone =
        surface.level === 'error'
          ? 'border-destructive/30 bg-destructive/5 text-destructive'
          : surface.level === 'warn'
            ? 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400'
            : 'border-border bg-muted/30 text-foreground';
      const Icon =
        surface.level === 'error'
          ? AlertCircle
          : surface.level === 'warn'
            ? AlertTriangle
            : Info;
      return (
        <div role="alert" className={cn('rounded-lg border px-3 py-2.5', tone)}>
          <div className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{surface.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{surface.body}</div>
            </div>
          </div>
        </div>
      );
    }

    case 'sources':
      return <SourcesBlock sources={surface.sources} />;

    case 'task':
    case 'queue':
    case 'execution':
    case 'metric-chart':
    case 'log-viewer':
    case 'screenshot':
    case 'terminal':
      return (
        <div className="rounded-lg border border-border bg-card px-3 py-4 text-sm text-muted-foreground">
          <div className="font-medium capitalize">
            {surface.kind.replace('-', ' ')}
          </div>
          <div className="mt-1 text-xs text-muted-foreground/70">
            Renderer pending Phase 6/7 wiring.
          </div>
        </div>
      );

    default: {
      const _exhaustive: never = surface;
      void _exhaustive;
      return <UnknownSurface kind={(surface as { kind: string }).kind} />;
    }
  }
}

function UnknownSurface({ kind }: { kind: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <div className="font-medium text-foreground">Unsupported surface</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            The assistant returned a surface kind this build does not render:{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">{kind}</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcesBlock({
  sources,
}: {
  sources: { id: string; label: string; href?: string; kind: string }[];
}) {
  return (
    <div className="rounded-md border border-border bg-card/50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Sources
      </div>
      <ul role="list" className="space-y-1">
        {sources.map(s => (
          <li key={s.id} className="text-sm">
            {s.href ? (
              <a href={s.href} className="text-primary hover:underline" rel="noreferrer noopener">
                {s.label}
              </a>
            ) : (
              <span className="text-foreground">{s.label}</span>
            )}
            <span className="ml-2 rounded border border-border bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground">
              {s.kind}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
