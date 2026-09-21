import { useQuery } from '@tanstack/react-query';
import { getAlerts } from '@/services/api.service';
import { useAlertStore } from '@/store/alert.store';
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { resolveAlert } from '@/services/api.service';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

const severityConfig = {
  critical: { icon: AlertTriangle, className: 'text-red-400 bg-red-400/10' },
  warning: { icon: AlertCircle, className: 'text-amber-400 bg-amber-400/10' },
  info: { icon: Info, className: 'text-sky-400 bg-sky-400/10' },
};

export function AlertPanel() {
  const alerts = useAlertStore(s => s.alerts);
  const setAlerts = useAlertStore(s => s.setAlerts);
  const resolveAlertStore = useAlertStore(s => s.resolveAlert);
  const addNotification = useUIStore(s => s.addNotification);

  useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const data = await getAlerts();
      setAlerts(data);
      return data;
    },
    refetchInterval: 30_000,
  });

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      resolveAlertStore(id);
      addNotification({ id: `resolved-${id}`, type: 'success', title: 'Alert resolved' });
    } catch {
      addNotification({
        id: `resolve-error-${id}`,
        type: 'error',
        title: 'Failed to resolve alert',
      });
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');

  return (
    <div className="rounded-xl border border-white/5 bg-[#0f1525]">
      <div className="border-b border-white/5 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Alerts</h3>
      </div>
      <ScrollArea className="h-64">
        {activeAlerts.length === 0 ? (
          <p className="p-4 text-xs text-white/40">No active alerts</p>
        ) : (
          <div className="divide-y divide-white/5">
            {activeAlerts.map(alert => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              return (
                <div key={alert.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={cn('rounded-lg p-1', config.className)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">
                        {alert.deviceName ?? 'System'}
                      </p>
                      <p className="text-xs text-white/60">{alert.description}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleResolve(alert.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
