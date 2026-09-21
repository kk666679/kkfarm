import { Card, CardContent } from '@/components/ui/card';
import type { Device } from '@smart-device-cloud/shared';
import { StatusIndicator } from './StatusIndicator';
import { formatDistanceToNow } from 'date-fns';
import { Smartphone } from 'lucide-react';

interface DeviceGridProps {
  devices: Device[];
  isLoading: boolean;
  onDeviceCommand: (deviceId: string, command: string, payload?: any) => void;
}

export function DeviceGrid({ devices, isLoading }: DeviceGridProps) {
  const safeDate = (value?: string) => (value ? new Date(value) : new Date());

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-10 w-10 bg-muted rounded-lg" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="text-center py-12">
        <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No devices found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {devices.map(device => {
        const batteryLevel = device.batteryLevel ?? 0;
        const lastSeen = safeDate(device.lastSeen);

        return (
          <Card key={device.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-lg">{device.model?.charAt(0) || 'D'}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{device.name}</h3>
                    <p className="text-sm text-muted-foreground">{device.model}</p>
                  </div>
                </div>
                <StatusIndicator status={device.status} showLabel={false} />
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Battery</span>
                  <span>{batteryLevel}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      batteryLevel > 50
                        ? 'bg-green-500'
                        : batteryLevel > 20
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Last seen</span>
                  <span className="text-xs">
                    {formatDistanceToNow(lastSeen, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
