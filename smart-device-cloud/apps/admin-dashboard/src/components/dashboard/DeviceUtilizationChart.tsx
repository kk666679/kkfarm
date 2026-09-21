import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { cloudService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export function DeviceUtilizationChart() {
  const { data: utilization, isLoading } = useQuery({
    queryKey: ['dashboard', 'utilization'],
    queryFn: () => cloudService.getDeviceUtilization(24),
    refetchInterval: 60000,
  });

  if (isLoading || !utilization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-slate-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={utilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Area
                type="monotone"
                dataKey="utilization"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Utilization %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
