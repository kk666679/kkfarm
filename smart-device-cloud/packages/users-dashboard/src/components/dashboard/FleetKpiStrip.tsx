import React from 'react';
import { cloudService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useQuery } from '@tanstack/react-query';

export function FleetKpiStrip() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['fleet', 'metrics'],
    queryFn: () => cloudService.getFleetMetrics(),
    refetchInterval: 30000,
  });

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Devices', value: metrics.totalDevices },
    { label: 'Online', value: metrics.onlineDevices },
    { label: 'Degraded', value: metrics.degradedDevices },
    { label: 'Offline', value: metrics.offlineDevices },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(item => (
        <Card key={item.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
