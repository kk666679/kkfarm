import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Cpu, MemoryStick, Thermometer, Battery } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceHealthData {
  deviceId: string;
  name: string;
  healthScore: number;
  battery: number;
  temperature: number;
  cpu: number;
  memory: number;
  issues: string[];
}

interface DeviceHealthOverviewProps {
  devices?: DeviceHealthData[];
}

export function DeviceHealthOverview({ devices }: DeviceHealthOverviewProps) {
  const healthData = devices || [
    {
      deviceId: 'device-1',
      name: 'Pixel 6',
      healthScore: 92,
      battery: 85,
      temperature: 38,
      cpu: 45,
      memory: 62,
      issues: [],
    },
    {
      deviceId: 'device-2',
      name: 'Galaxy S21',
      healthScore: 65,
      battery: 8,
      temperature: 42,
      cpu: 78,
      memory: 85,
      issues: ['Low battery', 'High memory usage'],
    },
    {
      deviceId: 'device-3',
      name: 'iPhone 14',
      healthScore: 78,
      battery: 45,
      temperature: 40,
      cpu: 65,
      memory: 72,
      issues: ['High temperature'],
    },
  ];

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Device Health Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {healthData.map(device => (
              <div key={device.deviceId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{device.name}</span>
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getHealthColor(device.healthScore))}
                    >
                      Score: {device.healthScore}
                    </Badge>
                  </div>
                  {device.issues.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {device.issues.length} issue(s)
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Battery className="h-3 w-3 text-muted-foreground" />
                    <span>Battery: {device.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3 w-3 text-muted-foreground" />
                    <span>Temp: {device.temperature}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="h-3 w-3 text-muted-foreground" />
                    <span>CPU: {device.cpu}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MemoryStick className="h-3 w-3 text-muted-foreground" />
                    <span>RAM: {device.memory}%</span>
                  </div>
                </div>

                {device.issues.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {device.issues.map((issue, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
