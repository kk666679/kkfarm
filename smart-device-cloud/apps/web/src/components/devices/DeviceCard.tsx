import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Device } from '@smart-device-cloud/shared';
import { cn } from '@/lib/utils';
import {
  Battery,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Wifi,
  MoreHorizontal,
  TerminalSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const stateColor: Record<Device['state'], string> = {
  provisioning: 'bg-sky-500',
  ready: 'bg-sky-400',
  online: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-red-500',
  maintenance: 'bg-gray-500',
  quarantined: 'bg-red-700',
  retiring: 'bg-orange-500',
};

interface DeviceCardProps {
  device: Device;
  onDetailsClick: (device: Device) => void;
}

export const DeviceCard = memo(function DeviceCard({ device, onDetailsClick }: DeviceCardProps) {
  const navigate = useNavigate();
  const displayName = device.name.length > 24 ? `${device.name.slice(0, 24)}...` : device.name;
  const lastHeartbeat = device.lastHeartbeat
    ? new Date(device.lastHeartbeat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No telemetry';

  return (
    <div
      className="group rounded-xl border border-white/5 bg-[#0f1525] p-4 shadow-lg transition hover:border-white/10"
      data-testid="device-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex h-2.5 w-2.5 rounded-full', stateColor[device.state])} />
          <span className="text-xs font-medium text-white/70 capitalize">{device.state}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition group-hover:opacity-100"
          onClick={() => onDetailsClick(device)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-semibold text-white" title={device.name}>
          {displayName}
        </p>
        <p className="text-xs text-white/50">
          {device.manufacturer} {device.model} • API {device.apiLevel}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
        <Metric icon={Battery} label="Battery" value={`${Math.round(device.batteryLevel ?? 0)}%`} />
        <Metric icon={Cpu} label="CPU" value={`${Math.round(device.cpuUsage ?? 0)}%`} />
        <Metric
          icon={MemoryStick}
          label="Memory"
          value={`${Math.round(device.memoryUsage ?? 0)}%`}
        />
        <Metric
          icon={HardDrive}
          label="Storage"
          value={`${Math.round(device.storageUsage ?? 0)}%`}
        />
        <Metric
          icon={Thermometer}
          label="Temp"
          value={`${(device.temperature ?? 0).toFixed(1)}°C`}
        />
        <Metric icon={Wifi} label="Latency" value={`${Math.round(device.networkLatency ?? 0)}ms`} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-white/40">{lastHeartbeat}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => navigate(`/devices/${device.id}/console`)}
          >
            <TerminalSquare className="mr-1 h-3.5 w-3.5" />
            Console
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onDetailsClick(device)}
          >
            Details
          </Button>
        </div>
      </div>

      {device.currentWorkloadName && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{device.currentWorkloadName}</span>
            <span>{Math.round(device.currentWorkloadProgress ?? 0)}%</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{ width: `${device.currentWorkloadProgress ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Battery;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      <span className="text-white/40">{label}</span>
      <span className="ml-auto font-medium text-white/80">{value}</span>
    </div>
  );
}
