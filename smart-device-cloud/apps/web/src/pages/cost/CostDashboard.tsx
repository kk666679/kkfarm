import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  PieChart,
  CreditCard,
  Download,
  Filter,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useState } from 'react';

export default function CostDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('month');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cost Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze your spending</p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="rounded-lg border p-2 bg-background"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month" selected>
              This Month
            </option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spend</p>
                  <p className="text-xl font-bold">$12,453.67</p>
                  <p className="text-xs text-green-500">+12.3% vs last month</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">vs Budget</p>
                  <p className="text-xl font-bold text-green-500">$2,546.33</p>
                  <p className="text-xs text-green-500">17% under budget</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <PieChart className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold">342</p>
                  <p className="text-xs text-green-500">+23 vs last month</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-amber-500/10 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cost/Device</p>
                  <p className="text-xl font-bold">$4.23</p>
                  <p className="text-xs text-red-500">+$0.12 vs last month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spend Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2">
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                    <div key={week} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                        style={{ height: `${[65, 72, 58, 78][i]}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{week}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Device Hours', value: 8450, color: 'bg-primary', percentage: 42 },
                    { name: 'API Calls', value: 3200, color: 'bg-green-500', percentage: 25 },
                    { name: 'Storage', value: 1800, color: 'bg-amber-500', percentage: 18 },
                    { name: 'Network', value: 1200, color: 'bg-amber-500', percentage: 10 },
                    { name: 'Support', value: 500, color: 'bg-purple-500', percentage: 5 },
                  ].map(cat => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color}`}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium w-16 text-right">${cat.value}</span>
                        <span className="text-sm text-muted-foreground w-10 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cost Breakdown</CardTitle>
              <div className="flex gap-2">
                <select className="rounded-lg border p-2 bg-background w-48">
                  <option value="device">By Device</option>
                  <option value="project">By Project</option>
                  <option value="team">By Team</option>
                  <option value="category">By Category</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'iPhone 15 Pro', cost: 1250.0, hours: 340, category: 'Device Hours' },
                  { name: 'Samsung Galaxy S24', cost: 980.5, hours: 280, category: 'Device Hours' },
                  { name: 'API Gateway', cost: 2100.0, calls: 1250000, category: 'API Calls' },
                  { name: 'Cloud Storage', cost: 890.0, gb: 450, category: 'Storage' },
                  { name: 'CDN Bandwidth', cost: 650.0, tb: 2.3, category: 'Network' },
                  { name: 'Premium Support', cost: 500.0, tier: 'Enterprise', category: 'Support' },
                ].map((item, i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <span className="text-sm text-muted-foreground">
                            {item.hours
                              ? `${item.hours}h`
                              : item.calls
                                ? `${(item.calls / 1000).toFixed(1)}k calls`
                                : item.gb
                                  ? `${item.gb} GB`
                                  : item.tier}
                          </span>
                          <span className="font-bold text-lg">${item.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Forecast</CardTitle>
              <CardDescription>Predicted spending based on current trends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Next Month</p>
                    <p className="text-3xl font-bold text-primary">$13,200</p>
                    <p className="text-xs text-green-500">+6% projected</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Next Quarter</p>
                    <p className="text-3xl font-bold text-primary">$39,800</p>
                    <p className="text-xs text-green-500">+5.2% projected</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Annual Projection</p>
                    <p className="text-3xl font-bold text-primary">$158,400</p>
                    <p className="text-xs text-green-500">+4.8% projected</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                          style={{ height: `${[70, 75, 72, 78, 80, 85][i]}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Budget Management</CardTitle>
              <Button>
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Set Budget
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <p className="text-3xl font-bold">$15,000</p>
                    <p className="text-xs text-green-500">$2,546 remaining</p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '83%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">83% used</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Quarterly Budget</p>
                    <p className="text-3xl font-bold">$45,000</p>
                    <p className="text-xs text-green-500">$5,200 remaining</p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">88% used</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">Annual Budget</p>
                    <p className="text-3xl font-bold">$180,000</p>
                    <p className="text-xs text-green-500">$21,600 remaining</p>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">88% used</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      level: 'warning',
                      message: 'Monthly budget at 83% - approaching limit',
                      threshold: '80%',
                    },
                    { level: 'info', message: 'Quarterly budget on track', threshold: '90%' },
                    {
                      level: 'info',
                      message: 'Annual budget projection within limits',
                      threshold: '95%',
                    },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          alert.level === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                        }`}
                      >
                        {alert.level === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <svg
                            className="h-4 w-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Alert threshold: {alert.threshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
