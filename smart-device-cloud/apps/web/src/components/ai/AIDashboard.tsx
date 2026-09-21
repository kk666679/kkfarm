import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface AIDashboardProps {
  insights?: any[];
  predictions?: any[];
  anomalies?: any[];
}

export function AIDashboard({ insights, predictions, anomalies }: AIDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{insights?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active recommendations</p>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Predictions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{predictions?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Model predictions</p>
          </div>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <div className="px-6 pb-6">
            <div className="text-2xl font-bold">{anomalies?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Detected issues</p>
          </div>
        </Card>
      </div>

      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight: any, i: number) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <TrendingUp className="mt-0.5 h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.title || insight.message}</p>
                  {insight.description && (
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  )}
                </div>
                {insight.confidence && (
                  <Badge variant="secondary">{Math.round(insight.confidence * 100)}%</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
