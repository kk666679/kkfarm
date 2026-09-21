import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Thermometer, Zap, Heart, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { useState } from 'react';

export default function AccountWarmup() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Warmup</h1>
        <p className="text-muted-foreground">Gradually build reputation for new accounts</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Thermometer className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Warmup Score</p>
                  <p className="text-xl font-bold">72/100</p>
                  <p className="text-xs text-green-500">+5 from yesterday</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Actions</p>
                  <p className="text-xl font-bold">47/100</p>
                  <p className="text-xs text-muted-foreground">Target: 100/day</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Heart className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-xl font-bold">4.2%</p>
                  <p className="text-xs text-green-500">+0.3% this week</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <p className="text-xl font-bold">Low</p>
                  <p className="text-xs text-green-500">Stable</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { time: '08:00', action: 'Like posts', target: 15, completed: 12 },
                  { time: '10:00', action: 'Comment on posts', target: 8, completed: 8 },
                  { time: '12:00', action: 'Follow accounts', target: 20, completed: 15 },
                  { time: '14:00', action: 'Share content', target: 5, completed: 3 },
                  { time: '16:00', action: 'Watch stories', target: 30, completed: 30 },
                  { time: '18:00', action: 'Engage with comments', target: 10, completed: 8 },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground w-16">
                        {item.time}
                      </span>
                      <span className="text-sm font-medium">{item.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(item.completed / item.target) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono text-right w-16">
                        {item.completed}/{item.target}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Warmup Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Account Age</span>
                      <span className="font-medium">14 days</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: '47%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target: 30 days</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Action Diversity</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '78%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target: 80%+</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Session Consistency</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target: 90%+</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Engagement Quality</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Target: 70%+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Warmup Schedules</CardTitle>
              <Button>
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Schedule management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warmup Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed analytics coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warmup Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    <span>Auto-adjust actions based on risk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    <span>Pause on high risk detection</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Enable weekend activity</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-input" />
                    <span>Rotate IP addresses</span>
                  </label>
                </div>

                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-3">Daily Limits</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <Label>Max Likes/Day</Label>
                      <input
                        type="number"
                        className="w-full rounded-lg border p-2"
                        defaultValue="100"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Max Comments/Day</Label>
                      <input
                        type="number"
                        className="w-full rounded-lg border p-2"
                        defaultValue="30"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Max Follows/Day</Label>
                      <input
                        type="number"
                        className="w-full rounded-lg border p-2"
                        defaultValue="50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
