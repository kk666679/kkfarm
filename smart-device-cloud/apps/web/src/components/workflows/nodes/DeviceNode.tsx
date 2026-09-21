'use client';
import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { NodeHeader } from '../shared/NodeHeader';
import { Smartphone } from 'lucide-react';

export type DeviceNodeData = {
  label: string;
  config: {
    deviceId?: string;
    action?: 'reboot' | 'install' | 'start' | 'stop' | 'maintenance';
    params?: Record<string, unknown>;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  durationMs?: number;
  error?: string;
};

export type DeviceNodeType = Node<DeviceNodeData, 'device'>;

export const DeviceNode = memo(({ data, selected }: NodeProps<DeviceNodeType>) => (
  <div
    className={cn(
      'min-w-[220px] overflow-hidden rounded-lg border bg-card shadow-sm',
      selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
      data.status === 'error' && 'border-destructive/50',
      data.status === 'success' && 'border-emerald-500/50'
    )}
  >
    <NodeHeader icon={<Smartphone className="h-3 w-3" />} title={data.label} status={data.status} />
    <div className="space-y-1 px-3 py-2 text-[11px]">
      <Row label="Device" value={data.config.deviceId ?? '—'} />
      <Row label="Action" value={data.config.action ?? '—'} />
      {data.error && <p className="line-clamp-2 text-destructive">{data.error}</p>}
    </div>
    <Handle
      type="target"
      position={Position.Left}
      id="input"
      className="!h-2 !w-2 !bg-muted-foreground"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="success"
      style={{ top: '40%' }}
      className="!h-2 !w-2 !bg-emerald-500"
    />
    <Handle
      type="source"
      position={Position.Right}
      id="error"
      style={{ top: '70%' }}
      className="!h-2 !w-2 !bg-destructive"
    />
  </div>
));
DeviceNode.displayName = 'DeviceNode';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
