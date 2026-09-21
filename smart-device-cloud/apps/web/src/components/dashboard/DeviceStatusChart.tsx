import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { DeviceStats } from '@/services/device.service';

interface DeviceStatusChartProps {
  stats: DeviceStats;
}

const STATUS_COLORS = {
  available: '#10b981',
  in_use: '#f59e0b',
  maintenance: '#f97316',
  offline: '#ef4444',
  reserved: '#3b82f6',
};

export function DeviceStatusChart({ stats }: DeviceStatusChartProps) {
  const data = stats
    ? [
        { name: 'Available', value: stats.available, color: STATUS_COLORS.available },
        { name: 'In Use', value: stats.in_use, color: STATUS_COLORS.in_use },
        { name: 'Maintenance', value: stats.maintenance, color: STATUS_COLORS.maintenance },
        { name: 'Offline', value: stats.offline, color: STATUS_COLORS.offline },
        { name: 'Reserved', value: stats.reserved, color: STATUS_COLORS.reserved },
      ]
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Device Status Distribution</CardTitle>
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
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
