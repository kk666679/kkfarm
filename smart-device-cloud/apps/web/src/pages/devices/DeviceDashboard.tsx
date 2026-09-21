'use client';

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, BatteryCharging, Gauge, ShieldCheck, Smartphone, TrendingUp, Wifi } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeviceHealthOverview } from '@/components/dashboard/DeviceHealthOverview';
import { DeviceStatusChart } from '@/components/dashboard/DeviceStatusChart';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { KpiCardGrid } from '@/components/dashboard/KpiCardGrid';
import { DeviceGrid } from '@/components/devices/DeviceGrid';
import { deviceService } from '@/services/device.service';

export default function DeviceDashboardPage() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['device-dashboard', 'stats'],
    queryFn: () => deviceService.getDeviceStats(),
    refetchInterval: 30000,
  });

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['device-dashboard', 'devices'],
    queryFn: () => deviceService.getDevices(),
    refetchInterval: 30000,
  });

  const safeStats = stats ?? {
    total: 0,
    available: 0,
    in_use: 0,
    maintenance: 0,
    offline: 0,
    reserved: 0,
    healthy: 0,
    warning: 0,
    critical: 0,
    avg_battery: 0,
    avg_temperature: 0,
    avg_cpu_usage: 0,
    avg_memory_usage: 0,
    avg_storage_usage: 0,
  };

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total devices',
        value: safeStats.total,
        trend: 8,
        icon: <Smartphone className="h-4 w-4" />,
        color: 'blue' as const,
      },
      {
        title: 'Online',
        value: safeStats.available,
        trend: 5,
        icon: <Wifi className="h-4 w-4" />,
        color: 'green' as const,
      },
      {
        title: 'Avg battery',
        value: Math.round(safeStats.avg_battery),
        ...(safeStats.avg_battery !== undefined ? { unit: '%' } : {}),
        trend: 2,
        icon: <BatteryCharging className="h-4 w-4" />,
        color: 'amber' as const,
      },
      {
        title: 'Attention',
        value: safeStats.offline + safeStats.critical,
        trend: -3,
        icon: <AlertTriangle className="h-4 w-4" />,
        color: 'red' as const,
      },
    ],
    [safeStats]
  );

  const healthData = useMemo(
    () =>
      (devices ?? [])
        .slice(0, 5)
        .map(device => {
          const battery = device.batteryLevel ?? 0;
          const cpu = device.cpuUsage ?? 0;
          const memory = device.memoryUsage ?? 0;
          const temperature = device.temperature ?? 0;
          const isOffline = device.status === 'offline';
          const isMaintenance = device.status === 'maintenance';

          const healthScore = Math.max(
            35,
            Math.min(
              99,
              100 -
                (isOffline ? 40 : isMaintenance ? 18 : 0) -
                Math.max(0, 50 - battery) / 2 -
                Math.max(0, cpu - 55) / 2 -
                Math.max(0, memory - 60) / 2 -
                Math.max(0, temperature - 38) * 2
            )
          );

          return {
            deviceId: device.id,
            name: device.name,
            healthScore: Math.round(healthScore),
            battery,
            temperature,
            cpu,
            memory,
            issues:
              isOffline || battery < 15
                ? ['Low battery / offline']
                : cpu > 80 || memory > 80
                  ? ['High utilization']
                  : temperature > 40
                    ? ['Temperature elevated']
                    : [],
          };
        }),
    [devices]
  );

  return (
    <PageContainer>
      <PageHeader
        title="Device Dashboard"
        description="Live fleet status, device health, and utilization across your connected estate."
        breadcrumbs={[
          { label: 'Devices', href: '/devices' },
          { label: 'Dashboard' },
        ]}
        actions={[
          {
            label: 'Open fleet',
            onClick: () => navigate('/devices'),
            variant: 'secondary',
          },
        ]}
      />

      <KpiCardGrid columns={4} className="mb-6">
        {summaryCards.map(card => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            unit={card.unit}
            trend={card.trend}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </KpiCardGrid>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DeviceStatusChart stats={safeStats} />
        <DeviceHealthOverview devices={healthData} />
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live device fleet</h2>
            <p className="text-sm text-muted-foreground">
              Frontline devices and operating health signals.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/devices')}>
            Manage devices
          </Button>
        </div>

        <DeviceGrid
          devices={(devices ?? []).slice(0, 8)}
          isLoading={devicesLoading}
          onDeviceCommand={() => undefined}
        />
      </section>
    </PageContainer>
  );
}
