import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UtilizationData {
  time: string;
  utilization: number;
  activeDevices: number;
  totalDevices: number;
}

interface DeviceUtilizationChartProps {
  data?: UtilizationData[];
}

export function DeviceUtilizationChart({ data }: DeviceUtilizationChartProps) {
  const chartData = data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Device Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="utilization"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="Utilization %"
              />
              <Area
                type="monotone"
                dataKey="activeDevices"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                name="Active Devices"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
