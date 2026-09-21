import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const { data: utilization, isLoading } = useQuery({
    queryKey: ['analytics', 'utilization'],
    queryFn: () => analyticsService.getDeviceUtilization('week'),
    refetchInterval: 60000,
  });

  const { data: _activity, isLoading: activityLoading } = useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: () => analyticsService.getRecentActivity(),
    refetchInterval: 30000,
  });

  if (isLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const taskData = [
    { name: 'Completed', value: 1250, color: COLORS[1] },
    { name: 'Failed', value: 23, color: COLORS[3] },
    { name: 'Running', value: 38, color: COLORS[2] },
    { name: 'Queued', value: 12, color: COLORS[0] },
  ];

  const throughputData = [
    { hour: '00:00', tasks: 12, success: 11 },
    { hour: '04:00', tasks: 8, success: 8 },
    { hour: '08:00', tasks: 25, success: 24 },
    { hour: '12:00', tasks: 35, success: 32 },
    { hour: '16:00', tasks: 28, success: 26 },
    { hour: '20:00', tasks: 18, success: 17 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
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

        <Card>
          <CardHeader>
            <CardTitle>Task Throughput (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#3b82f6" name="Tasks" />
                  <Bar dataKey="success" fill="#10b981" name="Successful" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Device Utilization Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Utilization %" />
                <Line
                  type="monotone"
                  dataKey="activeDevices"
                  stroke="#10b981"
                  name="Active Devices"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
