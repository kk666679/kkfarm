import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export interface PlanStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  reason?: string;
}

export interface ToolActivity {
  name: string;
  status: 'input-streaming' | 'input-available' | 'output-available' | 'output-error' | 'approval-requested';
  input?: Record<string, unknown>;
  output?: string;
}

export interface DeviceContext {
  id: string;
  name: string;
  status: string;
  task?: string;
}

export interface AIOperationsPanelProps {
  deviceContext?: DeviceContext;
  plan?: PlanStep[];
  tools?: ToolActivity[];
  isStreaming?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  className?: string;
}

export function AIOperationsPanel({
  deviceContext,
  plan: initialPlan,
  tools: initialTools,
  isStreaming: initialIsStreaming = false,
  onApprove,
  onReject,
  onPause,
  onResume,
  onStop,
  className,
}: AIOperationsPanelProps) {
  const [plan, setPlan] = useState<PlanStep[]>(initialPlan ?? []);
  const [tools, setTools] = useState<ToolActivity[]>(initialTools ?? []);
  const [isStreaming, setIsStreaming] = useState(initialIsStreaming);

  const stepStatusIcon = (status: PlanStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
      case 'running': return <RefreshCw className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const toolStatusBadge = (status: ToolActivity['status']) => {
    switch (status) {
      case 'input-streaming': return <Badge variant="secondary">Running</Badge>;
      case 'input-available': return <Badge variant="secondary">Completed</Badge>;
      case 'output-available': return <Badge variant="default">Done</Badge>;
      case 'output-error': return <Badge variant="destructive">Error</Badge>;
      case 'approval-requested': return <Badge variant="outline" className="text-amber-700">Awaiting Approval</Badge>;
      default: return null;
    }
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-500" />
          AI Operations
        </CardTitle>
        {isStreaming && (
          <Badge variant="secondary">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Thinking...
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4 overflow-y-auto">
        {deviceContext && (
          <div className="text-xs text-muted-foreground">
            Operating on: <span className="font-medium text-foreground">{deviceContext.name}</span>
          </div>
        )}

        {plan.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Plan</h4>
            <ol className="space-y-2">
              {plan.map((step, i) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  {stepStatusIcon(step.status)}
                  <span className={cn(
                    step.status === 'completed' && 'line-through text-muted-foreground',
                    step.status === 'failed' && 'text-red-600'
                  )}>
                    {i + 1}. {step.name}
                  </span>
                  {step.reason && (
                    <span className="text-xs text-muted-foreground ml-1" title={step.reason}>
                      ({step.reason})
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {tools.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tool Activity</h4>
            <div className="space-y-2">
              {tools.map((tool, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono">{tool.name}</span>
                    {toolStatusBadge(tool.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(onApprove || onReject || onPause || onResume || onStop) && (
          <div className="flex gap-2 pt-2 border-t">
            {onStop && (
              <Button variant="ghost" size="sm" onClick={onStop}>
                <Square className="h-3.5 w-3.5 mr-1" /> Stop
              </Button>
            )}
            {onPause && (
              <Button variant="ghost" size="sm" onClick={onPause}>
                <Pause className="h-3.5 w-3.5 mr-1" /> Pause
              </Button>
            )}
            {onResume && (
              <Button variant="ghost" size="sm" onClick={onResume}>
                <Play className="h-3.5 w-3.5 mr-1" /> Resume
              </Button>
            )}
            {onApprove && (
              <Button size="sm" onClick={onApprove}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
              </Button>
            )}
            {onReject && (
              <Button variant="outline" size="sm" onClick={onReject}>
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
