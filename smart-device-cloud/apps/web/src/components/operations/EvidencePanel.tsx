import { useState } from 'react';
import { ChevronDown, FileText, Link2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export interface EvidenceEntry {
  id: string;
  at: string;
  kind: 'state' | 'action' | 'tool-call' | 'screenshot' | 'output' | 'verification';
  label: string;
  actor?: 'user' | 'agent' | 'system';
  payload?: Record<string, unknown>;
  screenshotUrl?: string;
  hash?: string;
}

interface EvidencePanelProps {
  chainId: string;
  entries: EvidenceEntry[];
  title?: string;
  className?: string;
}

const KIND_LABEL: Record<EvidenceEntry['kind'], string> = {
  state: 'State',
  action: 'Action',
  'tool-call': 'Tool call',
  screenshot: 'Screenshot',
  output: 'Output',
  verification: 'Verification',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function EvidencePanel({
  chainId,
  entries,
  title = 'Evidence',
  className,
}: EvidencePanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <Link2 className="h-3 w-3" aria-hidden="true" />
          {chainId.slice(0, 12)}
        </span>
      </CardHeader>

      <CardContent>
        {entries.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No evidence entries yet.
          </div>
        ) : (
          <ol role="list" className="divide-y divide-border">
            {entries.map(e => {
              const open = expanded === e.id;
              return (
                <li key={e.id} className="py-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : e.id)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-2 rounded px-1 py-1 text-left hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {KIND_LABEL[e.kind]}
                      </span>
                      <span className="truncate text-sm text-foreground">{e.label}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {formatTime(e.at)}
                      </span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-muted-foreground transition-transform',
                          open && 'rotate-180'
                        )}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {open && (
                    <div className="space-y-2 px-1 pb-2 pt-1">
                      {e.actor && (
                        <div className="text-xs text-muted-foreground">Actor: {e.actor}</div>
                      )}
                      {e.screenshotUrl && (
                        <div className="overflow-hidden rounded border border-border">
                          <img src={e.screenshotUrl} alt={e.label} loading="lazy" className="w-full" />
                        </div>
                      )}
                      {e.payload && Object.keys(e.payload).length > 0 && (
                        <>
                          <Separator />
                          <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs">
                            {JSON.stringify(e.payload, null, 2)}
                          </pre>
                        </>
                      )}
                      {e.hash && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" aria-hidden="true" />
                          <span className="font-mono">{e.hash}</span>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
