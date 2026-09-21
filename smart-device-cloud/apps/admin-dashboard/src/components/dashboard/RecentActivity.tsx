import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { cloudService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => cloudService.getRecentActivity(10),
    refetchInterval: 15000,
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  if (isLoading || !activities) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <div className="h-4 w-4 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-3 w-48 bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map(
            (
              activity: {
                id: string;
                action: string;
                timestamp: string;
                severity: string;
                description: string;
              },
              index: number
            ) => (
              <div key={activity.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getSeverityIcon(activity.severity)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium text-sm ${getSeverityColor(activity.severity)}`}
                      >
                        {activity.action}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{activity.description}</p>
                  </div>
                </div>
                {index < activities.length - 1 && (
                  <div className="my-2 border-b border-slate-700" />
                )}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
