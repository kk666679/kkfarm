'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Trash2,
  Play,
  Pause,
  Copy,
  Save,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Zap,
  CheckCircle,
  XCircle,
  Terminal,
  Eye,
  EyeOff,
  Download,
} from 'lucide-react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  OnConnect,
  ReactFlowInstance,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { automationService, type AutomationRule } from '@/services/automation.service';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Types
interface CustomNodeData extends Record<string, unknown> {
  label: string;
  type: 'trigger' | 'condition' | 'action' | 'start' | 'end';
  config?: Record<string, any>;
  status?: 'idle' | 'running' | 'success' | 'error' | 'pending';
  icon?: React.ReactNode;
  description?: string;
  executionTime?: number;
  logs?: string[];
}

interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  nodeId?: string;
  nodeName?: string;
  details?: Record<string, any>;
}

interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  runningNodes: number;
  pendingNodes: number;
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
  success: boolean;
}

// Custom Node Components
function TriggerNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'px-4 py-2 min-w-[180px] bg-blue-50 dark:bg-blue-950 border-2 rounded-lg shadow-lg transition-all',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500/50'
          : 'border-blue-300 dark:border-blue-700',
        data.status === 'running' && 'animate-pulse border-blue-500',
        data.status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950',
        data.status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950',
        data.status === 'pending' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1.5 rounded-full',
            data.status === 'success'
              ? 'bg-green-100 dark:bg-green-900'
              : data.status === 'error'
                ? 'bg-red-100 dark:bg-red-900'
                : data.status === 'running'
                  ? 'bg-blue-100 dark:bg-blue-900 animate-pulse'
                  : 'bg-blue-100 dark:bg-blue-900'
          )}
        >
          <Zap
            className={cn(
              'h-4 w-4',
              data.status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : data.status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-blue-600 dark:text-blue-400'
            )}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{data.label}</p>
          {data.description && <p className="text-xs text-muted-foreground">{data.description}</p>}
        </div>
        {data.status && <StatusBadge status={data.status} />}
        {data.executionTime && (
          <span className="text-xs text-muted-foreground">{data.executionTime}ms</span>
        )}
      </div>
    </div>
  );
}

function ConditionNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'px-4 py-2 min-w-[180px] bg-yellow-50 dark:bg-yellow-950 border-2 rounded-lg shadow-lg transition-all',
        selected
          ? 'border-yellow-500 ring-2 ring-yellow-500/50'
          : 'border-yellow-300 dark:border-yellow-700',
        data.status === 'running' && 'animate-pulse border-yellow-500',
        data.status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950',
        data.status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950',
        data.status === 'pending' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1.5 rounded-full',
            data.status === 'success'
              ? 'bg-green-100 dark:bg-green-900'
              : data.status === 'error'
                ? 'bg-red-100 dark:bg-red-900'
                : data.status === 'running'
                  ? 'bg-yellow-100 dark:bg-yellow-900 animate-pulse'
                  : 'bg-yellow-100 dark:bg-yellow-900'
          )}
        >
          <Activity
            className={cn(
              'h-4 w-4',
              data.status === 'success'
                ? 'text-green-600 dark:text-green-400'
                : data.status === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-yellow-600 dark:text-yellow-400'
            )}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{data.label}</p>
          {data.description && <p className="text-xs text-muted-foreground">{data.description}</p>}
        </div>
        {data.status && <StatusBadge status={data.status} />}
        {data.executionTime && (
          <span className="text-xs text-muted-foreground">{data.executionTime}ms</span>
        )}
      </div>
    </div>
  );
}

function ActionNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'px-4 py-2 min-w-[180px] bg-green-50 dark:bg-green-950 border-2 rounded-lg shadow-lg transition-all',
        selected
          ? 'border-green-500 ring-2 ring-green-500/50'
          : 'border-green-300 dark:border-green-700',
        data.status === 'running' && 'animate-pulse border-green-500',
        data.status === 'success' && 'border-green-500 bg-green-100 dark:bg-green-900',
        data.status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950',
        data.status === 'pending' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'p-1.5 rounded-full',
            data.status === 'success'
              ? 'bg-green-200 dark:bg-green-800'
              : data.status === 'error'
                ? 'bg-red-100 dark:bg-red-900'
                : data.status === 'running'
                  ? 'bg-green-100 dark:bg-green-900 animate-pulse'
                  : 'bg-green-100 dark:bg-green-900'
          )}
        >
          {data.icon || (
            <Play
              className={cn(
                'h-4 w-4',
                data.status === 'success'
                  ? 'text-green-700 dark:text-green-300'
                  : data.status === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
              )}
            />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{data.label}</p>
          {data.description && <p className="text-xs text-muted-foreground">{data.description}</p>}
        </div>
        {data.status && <StatusBadge status={data.status} />}
        {data.executionTime && (
          <span className="text-xs text-muted-foreground">{data.executionTime}ms</span>
        )}
      </div>
    </div>
  );
}

function StartNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950 border-2 shadow-lg transition-all',
        selected
          ? 'border-purple-500 ring-2 ring-purple-500/50'
          : 'border-purple-300 dark:border-purple-700',
        data.status === 'running' && 'animate-pulse border-purple-500'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded-full">
          <Play className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <p className="font-medium text-sm">{data.label}</p>
      </div>
    </div>
  );
}

function EndNode({ data, selected }: { data: CustomNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        'px-4 py-2 rounded-full bg-red-50 dark:bg-red-950 border-2 shadow-lg transition-all',
        selected ? 'border-red-500 ring-2 ring-red-500/50' : 'border-red-300 dark:border-red-700',
        data.status === 'success' && 'border-green-500 bg-green-50 dark:bg-green-950',
        data.status === 'error' && 'border-red-500 bg-red-100 dark:bg-red-900'
      )}
    >
      <div className="flex items-center gap-2">
        <div className="p-1 bg-red-100 dark:bg-red-900 rounded-full">
          {data.status === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : data.status === 'error' ? (
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          ) : (
            <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
        </div>
        <p className="font-medium text-sm">{data.label}</p>
        {data.status && <StatusBadge status={data.status} />}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CustomNodeData['status'] }) {
  const variants = {
    idle: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-200 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-300 animate-pulse',
    running: 'bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-300 animate-pulse',
    success: 'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-300',
    error: 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-300',
  };

  return (
    <span
      className={cn('px-2 py-0.5 rounded-full text-xs font-medium', variants[status || 'idle'])}
    >
      {status}
    </span>
  );
}

// Execution Panel Component
function ExecutionPanel({
  isExecuting,
  metrics,
  logs,
  onStop,
  onClear,
  onExport,
}: {
  isExecuting: boolean;
  metrics: ExecutionMetrics;
  logs: ExecutionLog[];
  onStop: () => void;
  onClear: () => void;
  onExport: () => void;
}) {
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error' | 'success'>('all');
  const [isLogsVisible, setIsLogsVisible] = useState(true);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'all') return logs;
    return logs.filter(log => log.level === logFilter);
  }, [logs, logFilter]);

  const progress =
    metrics.totalNodes > 0
      ? ((metrics.completedNodes + metrics.failedNodes) / metrics.totalNodes) * 100
      : 0;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Execution Panel
            {isExecuting && (
              <Badge variant="default" className="animate-pulse">
                <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                Running
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setIsLogsVisible(!isLogsVisible)}>
              {isLogsVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="flex-1 h-1.5" />
              <span className="text-xs font-medium">{Math.round(progress)}%</span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-medium">
              {metrics.duration > 0 ? `${metrics.duration}s` : '0s'}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  metrics.success
                    ? 'bg-green-500'
                    : metrics.failedNodes > 0
                      ? 'bg-red-500'
                      : isExecuting
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-500'
                )}
              />
              <span className="text-sm font-medium capitalize">
                {isExecuting
                  ? 'Running'
                  : metrics.success
                    ? 'Success'
                    : metrics.failedNodes > 0
                      ? 'Failed'
                      : 'Idle'}
              </span>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">Nodes</p>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-green-500">
                {metrics.completedNodes} {'✓'}
              </span>
              <span className="text-red-500">{metrics.failedNodes} ✗</span>
              <span className="text-blue-500">{metrics.runningNodes} ⟳</span>
              <span className="text-yellow-500">{metrics.pendingNodes} ⏳</span>
            </div>
          </div>
        </div>

        {/* Logs */}
        {isLogsVisible && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {filteredLogs.length} logs
                </Badge>
              </div>
              <div className="flex gap-1">
                {['all', 'info', 'success', 'warn', 'error'].map(level => (
                  <Button
                    key={level}
                    variant={logFilter === level ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setLogFilter(level as any)}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            <ScrollArea className="h-[200px] rounded-lg border bg-muted/30 p-2 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No logs available</p>
              ) : (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className={cn(
                      'py-0.5 flex items-start gap-2 hover:bg-muted/50 px-1 rounded',
                      log.level === 'error' && 'text-red-500',
                      log.level === 'warn' && 'text-yellow-500',
                      log.level === 'success' && 'text-green-500',
                      log.level === 'info' && 'text-blue-500'
                    )}
                  >
                    <span className="text-muted-foreground whitespace-nowrap">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="font-semibold uppercase">{log.level}:</span>
                    <span>{log.message}</span>
                    {log.nodeName && (
                      <Badge variant="outline" className="text-xs">
                        {log.nodeName}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isExecuting ? (
            <Button variant="destructive" size="sm" onClick={onStop} className="flex-1">
              <Pause className="mr-2 h-4 w-4" />
              Stop Execution
            </Button>
          ) : (
            <Button variant="default" size="sm" disabled className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Execution History Component
function ExecutionHistory({ executions }: { executions: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Execution History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[150px]">
          {executions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No executions yet</p>
          ) : (
            <div className="space-y-2">
              {executions.map((exec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    {exec.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">{new Date(exec.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {exec.duration}s
                    </Badge>
                    <Badge variant={exec.success ? 'default' : 'destructive'} className="text-xs">
                      {exec.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Node Config Panel
function NodeConfigPanel({ node, onUpdate, onClose }: any) {
  const [config, setConfig] = useState(node?.data?.config || {});

  if (!node) return null;

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onUpdate({ ...node, data: { ...node.data, config: newConfig } });
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-card border-l border-border p-4 overflow-y-auto shadow-lg z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Configure Node</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <XCircle className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            value={node.data.label}
            onChange={e => onUpdate({ ...node, data: { ...node.data, label: e.target.value } })}
          />
        </div>

        {node.data.description !== undefined && (
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={node.data.description || ''}
              onChange={e =>
                onUpdate({ ...node, data: { ...node.data, description: e.target.value } })
              }
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Node Type</Label>
          <Badge variant="outline" className="capitalize">
            {node.data.type}
          </Badge>
        </div>

        {/* Dynamic config fields based on node type */}
        {node.data.type === 'trigger' && (
          <div className="space-y-2">
            <Label>Trigger Type</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={config.triggerType || 'webhook'}
              onChange={e => handleConfigChange('triggerType', e.target.value)}
            >
              <option value="webhook">Webhook</option>
              <option value="schedule">Schedule</option>
              <option value="event">Event</option>
              <option value="webhook">Device Status</option>
              <option value="condition">Condition Met</option>
            </select>
          </div>
        )}

        {node.data.type === 'condition' && (
          <div className="space-y-2">
            <Label>Condition Type</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={config.conditionType || 'equals'}
              onChange={e => handleConfigChange('conditionType', e.target.value)}
            >
              <option value="equals">Equals</option>
              <option value="not_equals">Not Equals</option>
              <option value="greater_than">Greater Than</option>
              <option value="less_than">Less Than</option>
              <option value="contains">Contains</option>
              <option value="starts_with">Starts With</option>
              <option value="ends_with">Ends With</option>
              <option value="regex">Regex Match</option>
            </select>
          </div>
        )}

        {node.data.type === 'action' && (
          <div className="space-y-2">
            <Label>Action Type</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={config.actionType || 'notify'}
              onChange={e => handleConfigChange('actionType', e.target.value)}
            >
              <option value="notify">Send Notification</option>
              <option value="email">Send Email</option>
              <option value="slack">Send Slack Message</option>
              <option value="webhook">Call Webhook</option>
              <option value="device">Execute Device Command</option>
              <option value="script">Run Script</option>
              <option value="wait">Wait</option>
            </select>
          </div>
        )}

        {node.data.config && (
          <div className="space-y-2">
            <Label>Configuration</Label>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(node.data.config, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
function Automation() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ExecutionMetrics>({
    totalNodes: 0,
    completedNodes: 0,
    failedNodes: 0,
    runningNodes: 0,
    pendingNodes: 0,
    startTime: null,
    endTime: null,
    duration: 0,
    success: false,
  });
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<
    Node<CustomNodeData>,
    Edge
  > | null>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { toast } = useToast();

  // Load automation rules
  const { data: rules = [] } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: () => automationService.list(),
  });

  // Convert rules to nodes and edges
  useEffect(() => {
    if (rules.length > 0) {
      const flowNodes: Node<CustomNodeData>[] = [
        {
          id: 'start',
          type: 'startNode',
          position: { x: 100, y: 100 },
          data: { label: 'Start', type: 'start' },
        },
        ...rules.map((rule: AutomationRule, index: number) => ({
          id: rule.id,
          type: 'actionNode',
          position: { x: 300 + index * 200, y: 100 + index * 50 },
          data: {
            label: rule.name,
            type: 'action' as const,
            description: rule.trigger,
            status: 'idle' as const,
            config: {
              trigger: rule.trigger,
              condition: rule.condition,
              action: rule.action,
            },
          },
        })),
        {
          id: 'end',
          type: 'endNode',
          position: {
            x: 100 + (rules.length + 1) * 200,
            y: 100 + rules.length * 50,
          },
          data: { label: 'End', type: 'end' as const },
        },
      ];

      const flowEdges: Edge[] = [
        {
          id: 'start-end',
          source: 'start',
          target: rules[0]?.id || 'end',
          type: 'smoothstep',
        },
        ...rules.map((rule: AutomationRule, index: number) => ({
          id: `edge-${rule.id}`,
          source: rule.id,
          target: index < rules.length - 1 ? rules[index + 1].id : 'end',
          type: 'smoothstep' as const,
          animated: rule.enabled,
        })),
      ];

      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [rules, setNodes, setEdges]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
    setShowConfig(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowConfig(false);
  }, []);

  const updateNode = useCallback(
    (updatedNode: Node<CustomNodeData>) => {
      setNodes(nds => nds.map(node => (node.id === updatedNode.id ? updatedNode : node)));
    },
    [setNodes]
  );

  // Drag and Drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<CustomNodeData> = {
        id: `${type}-${Date.now()}`,
        type: `${type}Node` as any,
        position,
        data: {
          label: `New ${type}`,
          type: type as CustomNodeData['type'],
          status: 'idle',
          description: `Automation ${type}`,
        },
      };

      setNodes(nds => nds.concat(newNode));
      toast({
        title: 'Node Added',
        description: `New ${type} node added to workflow`,
      });
    },
    [reactFlowInstance, setNodes, toast]
  );

  // Add log entry
  const addLog = useCallback(
    (
      level: ExecutionLog['level'],
      message: string,
      nodeId?: string,
      nodeName?: string,
      details?: Record<string, any>
    ) => {
      setExecutionLogs(prev => [
        {
          id: `log-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          level,
          message,
          nodeId,
          nodeName,
          details,
        },
        ...prev.slice(0, 99),
      ]);
    },
    []
  );

  // Execute automation
  const executeAutomation = useCallback(async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setExecutionLogs([]);
    const startTime = new Date();

    // Reset node statuses
    setNodes(nds =>
      nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          status: node.data.type === 'start' ? 'running' : ('pending' as const),
          executionTime: undefined,
        },
      }))
    );

    setMetrics({
      totalNodes: nodes.length,
      completedNodes: 0,
      failedNodes: 0,
      runningNodes: 1,
      pendingNodes: nodes.length - 1,
      startTime,
      endTime: null,
      duration: 0,
      success: false,
    });

    addLog('info', 'Starting automation execution...');
    addLog('info', `Found ${nodes.length} nodes in workflow`);

    try {
      // Execute each node sequentially
      const nodeIds = nodes
        .filter(n => n.data.type !== 'start' && n.data.type !== 'end')
        .map(n => n.id);

      for (let i = 0; i < nodeIds.length; i++) {
        const nodeId = nodeIds[i];
        const node = nodes.find(n => n.id === nodeId);

        if (!node) continue;

        // Update node to running
        setNodes(nds =>
          nds.map(n =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: 'running' as const } } : n
          )
        );

        setMetrics(prev => ({
          ...prev,
          runningNodes: prev.runningNodes + 1,
          pendingNodes: prev.pendingNodes - 1,
        }));

        addLog('info', `Executing node: ${node.data.label}`, nodeId, node.data.label);

        // Simulate execution with random delay
        const executionTime = Math.floor(Math.random() * 500) + 100;
        await new Promise(resolve => setTimeout(resolve, executionTime));

        // Random success/failure (90% success rate)
        const success = Math.random() < 0.9;

        if (success) {
          setNodes(nds =>
            nds.map(n =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: 'success' as const,
                      executionTime,
                    },
                  }
                : n
            )
          );

          setMetrics(prev => ({
            ...prev,
            completedNodes: prev.completedNodes + 1,
            runningNodes: prev.runningNodes - 1,
          }));

          addLog(
            'success',
            `Node "${node.data.label}" completed in ${executionTime}ms`,
            nodeId,
            node.data.label
          );
        } else {
          setNodes(nds =>
            nds.map(n =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: 'error' as const,
                      executionTime,
                    },
                  }
                : n
            )
          );

          setMetrics(prev => ({
            ...prev,
            failedNodes: prev.failedNodes + 1,
            runningNodes: prev.runningNodes - 1,
          }));

          addLog(
            'error',
            `Node "${node.data.label}" failed after ${executionTime}ms`,
            nodeId,
            node.data.label
          );

          // Stop execution on failure
          break;
        }
      }

      // Check final status
      const endTime = new Date();
      const duration = (endTime.getTime() - startTime.getTime()) / 1000;
      const finalMetrics = { ...metrics, endTime, duration };
      const allSuccess = finalMetrics.failedNodes === 0;

      setMetrics(finalMetrics);

      if (allSuccess) {
        setNodes(nds =>
          nds.map(n =>
            n.data.type === 'end' ? { ...n, data: { ...n.data, status: 'success' as const } } : n
          )
        );
        addLog('success', `✅ Automation completed successfully in ${duration}s`);
        toast({
          title: 'Automation Complete',
          description: `All nodes executed successfully in ${duration}s`,
        });
      } else {
        setNodes(nds =>
          nds.map(n =>
            n.data.type === 'end' ? { ...n, data: { ...n.data, status: 'error' as const } } : n
          )
        );
        addLog('error', `❌ Automation failed after ${duration}s`);
        toast({
          title: 'Automation Failed',
          description: `${finalMetrics.failedNodes} nodes failed during execution`,
          variant: 'destructive',
        });
      }

      // Save to history
      setExecutionHistory(prev => [
        {
          timestamp: startTime,
          duration,
          success: allSuccess,
          nodes: nodes.length,
          completed: finalMetrics.completedNodes,
          failed: finalMetrics.failedNodes,
        },
        ...prev.slice(0, 19),
      ]);
    } catch (error) {
      addLog('error', `Execution error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: 'Execution Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, setNodes, addLog, toast, isExecuting, metrics]);

  // Stop execution
  const stopExecution = useCallback(() => {
    setIsExecuting(false);
    addLog('warn', 'Execution stopped by user');
    toast({
      title: 'Execution Stopped',
      description: 'Automation execution was stopped by user',
    });
  }, [addLog, toast]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setExecutionLogs([]);
    addLog('info', 'Logs cleared');
  }, [addLog]);

  // Export logs
  const exportLogs = useCallback(() => {
    const logData = executionLogs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      level: log.level,
      message: log.message,
      nodeName: log.nodeName || 'N/A',
    }));

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `execution-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Logs Exported',
      description: 'Execution logs exported successfully',
    });
  }, [executionLogs, toast]);

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    try {
      const primaryRule = nodes.find(
        node =>
          node.data.type === 'action' ||
          node.data.type === 'trigger' ||
          node.data.type === 'condition'
      );
      const workflowData = {
        name: primaryRule?.data.label || 'Saved workflow',
        trigger: primaryRule?.data.config?.trigger || '',
        condition: primaryRule?.data.config?.condition || '',
        action: primaryRule?.data.config?.action || '',
        enabled: true,
      };

      await automationService.create(workflowData);

      toast({
        title: 'Workflow Saved',
        description: 'Automation workflow saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save workflow',
        variant: 'destructive',
      });
    }
  }, [nodes, toast]);

  return (
    <div className="h-[calc(100vh-120px)] w-full">
      <div className="flex h-full gap-4">
        {/* Left Sidebar */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div
                draggable
                onDragStart={e => e.dataTransfer.setData('application/reactflow', 'trigger')}
                className="p-2 border rounded cursor-grab hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Trigger</span>
                </div>
              </div>
              <div
                draggable
                onDragStart={e => e.dataTransfer.setData('application/reactflow', 'condition')}
                className="p-2 border rounded cursor-grab hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Condition</span>
                </div>
              </div>
              <div
                draggable
                onDragStart={e => e.dataTransfer.setData('application/reactflow', 'action')}
                className="p-2 border rounded cursor-grab hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Action</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nodes</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Connections</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isExecuting ? 'default' : 'secondary'}>
                  {isExecuting ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Running
                    </span>
                  ) : (
                    'Idle'
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <ExecutionHistory executions={executionHistory} />
        </div>

        {/* Center - React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow<Node<CustomNodeData>, Edge>
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={
              {
                triggerNode: TriggerNode,
                conditionNode: ConditionNode,
                actionNode: ActionNode,
                startNode: StartNode,
                endNode: EndNode,
              } as NodeTypes
            }
            onInit={instance => setReactFlowInstance(instance)}
            fitView
            className="bg-muted/20"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              className="bg-background"
            />
            <Controls className="bg-background shadow-lg rounded-lg border" />
            <MiniMap
              className="bg-background shadow-lg rounded-lg border"
              nodeColor={node => {
                const data = node.data as CustomNodeData;
                switch (data?.type) {
                  case 'trigger':
                    return '#3b82f6';
                  case 'condition':
                    return '#eab308';
                  case 'action':
                    return '#22c55e';
                  case 'start':
                    return '#8b5cf6';
                  case 'end':
                    return '#ef4444';
                  default:
                    return '#6b7280';
                }
              }}
            />

            {/* Toolbar */}
            <Panel position="top-left" className="flex gap-2">
              <div className="bg-background shadow-lg rounded-lg border p-1 flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => fitView()} title="Fit View">
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => zoomIn()} title="Zoom In">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => zoomOut()} title="Zoom Out">
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </div>
            </Panel>

            {/* Action Buttons */}
            <Panel position="top-right" className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={executeAutomation}
                disabled={isExecuting || nodes.length === 0}
              >
                {isExecuting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>
              <Button variant="outline" size="sm" onClick={saveWorkflow}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
            </Panel>

            {/* Viewport Info */}
            <Panel
              position="bottom-right"
              className="bg-background/90 backdrop-blur-sm shadow-lg rounded-lg border p-2 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Zoom:</span>
                  <span>{Math.round((reactFlowInstance?.getZoom() || 1) * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">Position:</span>
                  <span>
                    X: {Math.round(reactFlowInstance?.getViewport().x || 0)}, Y:{' '}
                    {Math.round(reactFlowInstance?.getViewport().y || 0)}
                  </span>
                </div>
              </div>
            </Panel>
          </ReactFlow>

          {/* Node Config Panel */}
          {showConfig && selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onUpdate={updateNode}
              onClose={() => setShowConfig(false)}
            />
          )}
        </div>

        {/* Right - Execution Panel */}
        <div className="w-96 flex-shrink-0">
          <ExecutionPanel
            isExecuting={isExecuting}
            metrics={metrics}
            logs={executionLogs}
            onStop={stopExecution}
            onClear={clearLogs}
            onExport={exportLogs}
          />
        </div>
      </div>
    </div>
  );
}

export default function AutomationWithProvider() {
  return (
    <ReactFlowProvider>
      <Automation />
    </ReactFlowProvider>
  );
}
