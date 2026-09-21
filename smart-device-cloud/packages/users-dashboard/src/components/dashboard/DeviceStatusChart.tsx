import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { cloudService } from '@/services/api';
import type { Device } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

export function DeviceStatusChart() {
  const { data: devices, isLoading } = useQuery({
    queryKey: ['dashboard', 'devices'],
    queryFn: () => cloudService.getDevices(),
    refetchInterval: 30000,
  });

  if (isLoading || !devices) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-slate-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const statusCounts = devices.reduce<Record<string, number>>((acc, device) => {
    const status = String(device.status ?? 'unknown').toLowerCase();
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  const data = devices.map((device: Device, index: number) => {
    const rawStatus = typeof device.status === 'string' ? device.status.toLowerCase() : 'unknown';
    return {
      name: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
      value: statusCounts[rawStatus] || 0,
      color: COLORS[index % COLORS.length],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  if (!percent) return `${name} 0%`;
                  return `${name} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color ?? '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
