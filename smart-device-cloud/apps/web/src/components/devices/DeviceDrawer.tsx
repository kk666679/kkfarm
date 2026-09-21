import { Device } from '@smart-device-cloud/shared';
import {
  X,
  Cpu,
  MemoryStick,
  HardDrive,
  Battery,
  Thermometer,
  Wifi,
  Globe,
  Calendar,
  Clock,
  Radio,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Power,
  Play,
  Square,
  Pause,
  TerminalSquare,
  FileText,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { sendDeviceCommand } from '@/services/api.service';
import { cn } from '@/lib/utils';

interface DeviceDrawerProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceDrawer({ device, isOpen, onClose }: DeviceDrawerProps) {
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!device) return null;

  const handleAction = async (action: string) => {
    setIsLoading(true);
    try {
      await sendDeviceCommand(device.id, action);
    } finally {
      setIsLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-40 w-full border-l border-white/5 bg-[#0b0f1c] shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          'md:w-[480px]'
        )}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{device.name}</h2>
            <p className="text-xs text-white/50">{device.id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-56px)]">
          <div className="space-y-6 p-4">
            <Section title="Overview">
              <Row icon={Smartphone} label="State" value={device.state} />
              <Row icon={Globe} label="Region" value={device.region} />
              <Row
                icon={Calendar}
                label="Created"
                value={new Date(device.createdAt).toLocaleDateString()}
              />
              <Row
                icon={Clock}
                label="Last Heartbeat"
                value={
                  device.lastHeartbeat ? new Date(device.lastHeartbeat).toLocaleString() : 'Never'
                }
              />
              <Row icon={Radio} label="Session" value={device.sessionId ?? 'None'} />
            </Section>

            <Separator className="bg-white/5" />

            <Section title="Health">
              <MetricRow icon={Cpu} label="CPU" value={`${Math.round(device.cpuUsage ?? 0)}%`} />
              <MetricRow
                icon={MemoryStick}
                label="Memory"
                value={`${Math.round(device.memoryUsage ?? 0)}%`}
              />
              <MetricRow
                icon={HardDrive}
                label="Storage"
                value={`${Math.round(device.storageUsage ?? 0)}%`}
              />
              <MetricRow
                icon={Battery}
                label="Battery"
                value={`${Math.round(device.batteryLevel ?? 0)}%`}
              />
              <MetricRow
                icon={Thermometer}
                label="Temperature"
                value={`${(device.temperature ?? 0).toFixed(1)}°C`}
              />
              <MetricRow
                icon={Wifi}
                label="Latency"
                value={`${Math.round(device.networkLatency ?? 0)}ms`}
              />
            </Section>

            <Separator className="bg-white/5" />

            <Section title="System">
              <Row
                icon={Smartphone}
                label="Android"
                value={`${device.androidVersion ?? 'Unknown'} (API ${device.apiLevel ?? 'N/A'})`}
              />
              <Row
                icon={ShieldCheck}
                label="Security Patch"
                value={
                  device.securityPatchDate
                    ? new Date(device.securityPatchDate).toLocaleDateString()
                    : 'Unknown'
                }
              />
              <Row icon={Settings} label="Agent" value={device.agentVersion} />
            </Section>

            <Separator className="bg-white/5" />

            <Section title="Actions">
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  icon={RefreshCw}
                  label="Restart Agent"
                  onClick={() => setConfirmAction('restart')}
                />
                <ActionButton
                  icon={Power}
                  label="Reboot"
                  onClick={() => setConfirmAction('reboot')}
                />
                <ActionButton icon={Play} label="Start Workload" onClick={() => {}} />
                <ActionButton icon={Square} label="Stop Workload" onClick={() => {}} />
                <ActionButton icon={Pause} label="Pause Workload" onClick={() => {}} />
                <ActionButton icon={TerminalSquare} label="Console" onClick={() => {}} />
                <ActionButton icon={FileText} label="View Logs" onClick={() => {}} />
                <ActionButton icon={RefreshCw} label="Refresh Telemetry" onClick={() => {}} />
              </div>
            </Section>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/70">
            Are you sure you want to {confirmAction} device {device.name}?
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmAction(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => confirmAction && handleAction(confirmAction)}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-white/40" />
      <span className="text-white/60">{label}</span>
      <span className="ml-auto font-medium text-white/90">{value ?? 'N/A'}</span>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-white/40" />
      <span className="text-white/60">{label}</span>
      <div className="ml-auto flex items-center gap-2">
        <div className="h-1.5 w-24 rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-sky-500"
            style={{ width: value.replace('%', '') + '%' }}
          />
        </div>
        <span className="w-12 text-right text-xs text-white/80">{value}</span>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Cpu;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="secondary" className="justify-start gap-2" onClick={onClick}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
