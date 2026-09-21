import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Database,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Network,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function MemoryExplorer() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memory Explorer</h1>
          <p className="text-muted-foreground">Explore and manage agent memory systems</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stm">Short-term Memory</TabsTrigger>
          <TabsTrigger value="ltm">Long-term Memory</TabsTrigger>
          <TabsTrigger value="consolidation">Consolidation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Memories</p>
                  <p className="text-xl font-bold">47,832</p>
                  <p className="text-xs text-green-500">+1,234 this week</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Database className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">STM Entries</p>
                  <p className="text-xl font-bold">12,456</p>
                  <p className="text-xs text-green-500">+234 today</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Database className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">LTM Entries</p>
                  <p className="text-xl font-bold">35,376</p>
                  <p className="text-xs text-green-500">+1,000 this week</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-purple-500/10 p-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consolidation Rate</p>
                  <p className="text-xl font-bold">94%</p>
                  <p className="text-xs text-green-500">+2% this month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Memory Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Episodic', count: 18432, color: 'bg-blue-500', percentage: 38 },
                    { name: 'Semantic', count: 15678, color: 'bg-green-500', percentage: 33 },
                    { name: 'Procedural', count: 8745, color: 'bg-amber-500', percentage: 18 },
                    { name: 'Working', count: 5432, color: 'bg-purple-500', percentage: 11 },
                  ].map(type => (
                    <div key={type.name} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{type.name}</span>
                        <span className="font-mono">
                          {type.count.toLocaleString()} ({type.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${type.color}`}
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: 'consolidation',
                      message: 'Consolidated 1,234 STM → LTM entries',
                      time: '5m ago',
                    },
                    {
                      type: 'retrieval',
                      message: 'Retrieved 45 memories for agent task',
                      time: '2m ago',
                    },
                    {
                      type: 'storage',
                      message: 'Stored new semantic fact: "Device Farm API v2 released"',
                      time: '1m ago',
                    },
                    { type: 'cleanup', message: 'Pruned 234 expired STM entries', time: '5m ago' },
                  ].map((event, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="h-4 w-4 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
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

        <TabsContent value="stm" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Short-term Memory (STM)</CardTitle>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search STM..."
                  className="rounded-lg border p-2 w-64"
                />
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export STM
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">STM browser coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ltm" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Long-term Memory (LTM)</CardTitle>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search LTM..."
                  className="rounded-lg border p-2 w-64"
                />
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export LTM
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">LTM browser coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidation" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Memory Consolidation</CardTitle>
              <Button variant="outline">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Run Consolidation
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Consolidation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Consolidation Interval</Label>
                      <select className="w-full max-w-xs rounded-lg border p-2">
                        <option value="15min">Every 15 minutes</option>
                        <option value="hourly" selected>
                          Hourly
                        </option>
                        <option value="4hour">Every 4 hours</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>STM Retention Period</Label>
                      <select className="w-full max-w-xs rounded-lg border p-2">
                        <option value="1h">1 hour</option>
                        <option value="6h">6 hours</option>
                        <option value="24h" selected>
                          24 hours
                        </option>
                        <option value="72h">72 hours</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Consolidation Threshold</Label>
                      <input
                        type="number"
                        className="w-full max-w-xs rounded-lg border p-2"
                        defaultValue="100"
                        placeholder="Min STM entries before consolidation"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Importance Threshold</Label>
                      <input
                        type="number"
                        className="w-full max-w-xs rounded-lg border p-2"
                        defaultValue="0.7"
                        step="0.1"
                        min="0"
                        max="1"
                        placeholder="0.0 - 1.0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="autoConsolidate"
                        defaultChecked
                        className="rounded border-input"
                      />
                      <Label htmlFor="autoConsolidate" className="font-normal cursor-pointer">
                        Enable automatic consolidation
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="preserveContext"
                        defaultChecked
                        className="rounded border-input"
                      />
                      <Label htmlFor="preserveContext" className="font-normal cursor-pointer">
                        Preserve conversation context during consolidation
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
