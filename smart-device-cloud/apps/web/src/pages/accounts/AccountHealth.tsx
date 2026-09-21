import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Heart, Activity, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function AccountHealth() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Health</h1>
        <p className="text-muted-foreground">Monitor and maintain account health metrics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Heart className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overall Health</p>
                  <p className="text-xl font-bold text-green-500">94%</p>
                  <p className="text-xs text-green-500">+2% this week</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activity Score</p>
                  <p className="text-xl font-bold">87%</p>
                  <p className="text-xs text-green-500">+3% this month</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Growth Rate</p>
                  <p className="text-xl font-bold">+12%</p>
                  <p className="text-xs text-green-500">vs last month</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-xl font-bold">2</p>
                  <p className="text-xs text-amber-500">Requires attention</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Health Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Authentication', score: 100, status: 'healthy' },
                  { name: 'API Access', score: 98, status: 'healthy' },
                  { name: 'Rate Limits', score: 92, status: 'healthy' },
                  { name: 'Security', score: 95, status: 'healthy' },
                  { name: 'Compliance', score: 88, status: 'warning' },
                  { name: 'Performance', score: 91, status: 'healthy' },
                ].map(factor => (
                  <div
                    key={factor.name}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${factor.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`}
                      />
                      <span className="font-medium">{factor.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${factor.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500'}`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono font-medium w-12 text-right">
                        {factor.score}%
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${factor.status === 'healthy' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}
                      >
                        {factor.status}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: 'success',
                      message: 'SSL certificate renewed successfully',
                      time: '2h ago',
                    },
                    { type: 'warning', message: 'API rate limit at 85% capacity', time: '4h ago' },
                    { type: 'info', message: 'New security patch applied', time: '1d ago' },
                    { type: 'success', message: 'Backup completed successfully', time: '2d ago' },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.type === 'success'
                            ? 'bg-green-500/10'
                            : event.type === 'warning'
                              ? 'bg-amber-500/10'
                              : 'bg-blue-500/10'
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {event.type === 'success' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                          {event.type === 'warning' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.593 1.504-3.101L12 3.5a1.5 1.5 0 00-3 0l-6.5 7.5a1.5 1.5 0 000 3z"
                            />
                          )}
                          {event.type === 'info' && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.message}</p>
                        <p className="text-xs text-muted-foreground">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed metrics dashboard coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Alerts</CardTitle>
              <Button variant="outline" size="sm">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Alert management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Health History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Historical health data coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
