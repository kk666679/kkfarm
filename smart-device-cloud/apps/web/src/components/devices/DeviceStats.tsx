import { Card, CardContent } from '@/components/ui/card';
import {
  Smartphone,
  CheckCircle,
  AlertCircle,
  Battery,
  Thermometer,
  Activity,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceStatsProps {
  stats?: {
    total: number;
    available: number;
    in_use: number;
    maintenance: number;
    offline: number;
    reserved: number;
    healthy: number;
    warning: number;
    critical: number;
    avg_battery: number;
    avg_temperature: number;
    avg_cpu_usage: number;
    avg_memory_usage: number;
    avg_storage_usage: number;
  };
}

export function DeviceStats({ stats }: DeviceStatsProps) {
  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Devices',
      value: stats.total,
      icon: Smartphone,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Available',
      value: stats.available,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'In Use',
      value: stats.in_use,
      icon: Activity,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Offline',
      value: stats.offline,
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      title: 'Avg Battery',
      value: `${Math.round(stats.avg_battery || 0)}%`,
      icon: Battery,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Avg Temperature',
      value: `${Math.round(stats.avg_temperature || 0)}°C`,
      icon: Thermometer,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Avg CPU',
      value: `${Math.round(stats.avg_cpu_usage || 0)}%`,
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Avg Storage',
      value: `${Math.round(stats.avg_storage_usage || 0)}%`,
      icon: HardDrive,
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={cn('rounded-lg p-2', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
