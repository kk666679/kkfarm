import { Cpu, Monitor, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { EmptyState, RelativeTime } from '@/components/common';

export interface ActiveWorkflowRun {
  id: string;
  name: string;
  /** 0–1 */
  progress: number;
  deviceCount: number;
  startedAt: string;
}

export interface ActiveSession {
  id: string;
  deviceId: string;
  deviceName: string;
  startedAt: string;
}

export interface ActiveAgentRun {
  id: string;
  agentName: string;
  status: 'running' | 'waiting-approval';
  startedAt: string;
}

interface ActiveOperationsPanelProps {
  workflows: ActiveWorkflowRun[];
  sessions: ActiveSession[];
  agentRuns: ActiveAgentRun[];
  onOpenWorkflow?: (id: string) => void;
  onOpenSession?: (id: string) => void;
  onOpenAgentRun?: (id: string) => void;
  title?: string;
  className?: string;
}

export function ActiveOperationsPanel({
  workflows,
  sessions,
  agentRuns,
  onOpenWorkflow,
  onOpenSession,
  onOpenAgentRun,
  title = 'Active operations',
  className,
}: ActiveOperationsPanelProps) {
  const total = workflows.length + sessions.length + agentRuns.length;

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">{total}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {total === 0 ? (
          <EmptyState
            icon={PlayCircle}
            size="sm"
            title="Nothing running"
            description="No workflows, sessions, or agents are active right now."
          />
        ) : (
          <Tabs defaultValue={workflows.length > 0 ? 'workflows' : sessions.length > 0 ? 'sessions' : 'agents'}>
            <TabsList>
              <TabsTrigger value="workflows" className="gap-1.5">
                <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Workflows
                <span className="ml-1 tabular-nums text-muted-foreground">{workflows.length}</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="gap-1.5">
                <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                Sessions
                <span className="ml-1 tabular-nums text-muted-foreground">{sessions.length}</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-1.5">
                <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                Agents
                <span className="ml-1 tabular-nums text-muted-foreground">{agentRuns.length}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="mt-3">
              {workflows.length === 0 ? (
                <InlineEmpty message="No running workflows." />
              ) : (
                <ul role="list" className="space-y-2">
                  {workflows.map(w => (
                    <li key={w.id}>
                      <button
                        type="button"
                        onClick={() => onOpenWorkflow?.(w.id)}
                        className="w-full rounded-md px-2 py-1.5 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {w.name}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {w.deviceCount} device{w.deviceCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <Progress value={w.progress * 100} className="mt-1.5 h-1" />
                        <div className="mt-1 text-xs text-muted-foreground">
                          <RelativeTime value={w.startedAt} />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="sessions" className="mt-3">
              {sessions.length === 0 ? (
                <InlineEmpty message="No live sessions." />
              ) : (
                <ul role="list" className="space-y-1">
                  {sessions.map(s => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => onOpenSession?.(s.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Monitor className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate text-sm text-foreground">{s.deviceName}</span>
                        </span>
                        <RelativeTime value={s.startedAt} className="shrink-0 text-xs text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="agents" className="mt-3">
              {agentRuns.length === 0 ? (
                <InlineEmpty message="No active agents." />
              ) : (
                <ul role="list" className="space-y-1">
                  {agentRuns.map(r => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onOpenAgentRun?.(r.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Cpu className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate text-sm text-foreground">{r.agentName}</span>
                        </span>
                        {r.status === 'waiting-approval' && (
                          <span className="shrink-0 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            Approval
                          </span>
                        )}
                        <RelativeTime value={r.startedAt} className="shrink-0 text-xs text-muted-foreground" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

function InlineEmpty({ message }: { message: string }) {
  return (
    <p className="py-6 text-center text-xs text-muted-foreground">{message}</p>
  );
}
