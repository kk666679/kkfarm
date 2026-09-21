import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope,
  Bug,
  Zap,
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  Cpu,
  HardDrive,
  Wifi,
  Terminal,
  Play,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

export default function DiagnosticsPanel() {
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnostics Panel</h1>
          <p className="text-muted-foreground">System diagnostics and troubleshooting tools</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Run Diagnostics
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patterns">Failure Patterns</TabsTrigger>
          <TabsTrigger value="rca">Root Cause Analysis</TabsTrigger>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Stethoscope className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-xl font-bold text-green-500">Healthy</p>
                  <p className="text-xs text-green-500">All systems operational</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-xl font-bold">34%</p>
                  <p className="text-xs text-green-500">Normal range</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <HardDrive className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Memory Usage</p>
                  <p className="text-xl font-bold">42%</p>
                  <p className="text-xs text-green-500">Within limits</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Wifi className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Network Latency</p>
                  <p className="text-xl font-bold">12ms</p>
                  <p className="text-xs text-green-500">Optimal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    severity: 'warning',
                    title: 'Disk space at 85% on node-3',
                    component: 'Storage',
                    time: '10m ago',
                  },
                  {
                    severity: 'info',
                    title: 'Scheduled maintenance in 2 hours',
                    component: 'Scheduler',
                    time: '1h ago',
                  },
                  {
                    severity: 'critical',
                    title: 'Node-7 offline',
                    component: 'Node',
                    time: '5m ago',
                  },
                ].map((issue, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border-l-4 ${
                      issue.severity === 'critical'
                        ? 'border-red-500 bg-red-500/5'
                        : issue.severity === 'warning'
                          ? 'border-amber-500 bg-amber-500/5'
                          : 'border-blue-500 bg-blue-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {issue.component} • {issue.time}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          issue.severity === 'critical'
                            ? 'bg-red-500/10 text-red-500'
                            : issue.severity === 'warning'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quick Diagnostics</CardTitle>
                <Button variant="outline" size="sm">
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Run All
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: 'System Health Check',
                    status: 'passed',
                    duration: '2.3s',
                    lastRun: '5m ago',
                  },
                  {
                    name: 'Network Connectivity',
                    status: 'passed',
                    duration: '1.2s',
                    lastRun: '5m ago',
                  },
                  {
                    name: 'Disk Space Check',
                    status: 'warning',
                    duration: '0.8s',
                    lastRun: '5m ago',
                  },
                  {
                    name: 'Memory Leak Detection',
                    status: 'passed',
                    duration: '3.1s',
                    lastRun: '5m ago',
                  },
                  {
                    name: 'Network Latency Test',
                    status: 'passed',
                    duration: '0.5s',
                    lastRun: '5m ago',
                  },
                  {
                    name: 'Database Integrity',
                    status: 'passed',
                    duration: '2.1s',
                    lastRun: '5m ago',
                  },
                ].map((check, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          check.status === 'passed' ? 'bg-green-500/10' : 'bg-amber-500/10'
                        }`}
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {check.status === 'passed' ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.593 1.504-3.101L12 3.5a1.5 1.5 0 00-3 0l-6.5 7.5a1.5 1.5 0 000 3z"
                            />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last run: {check.lastRun} • Duration: {check.duration}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${check.status === 'passed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}
                    >
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failure Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Failure pattern analysis coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Root Cause Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Root cause analysis tools coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="playbooks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Remediation Playbooks</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Playbook
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  title: 'Node Offline Recovery',
                  category: 'Infrastructure',
                  steps: 5,
                  lastUsed: '2h ago',
                  autoRun: true,
                },
                {
                  title: 'Disk Space Cleanup',
                  category: 'Storage',
                  steps: 3,
                  lastUsed: '1d ago',
                  autoRun: true,
                },
                {
                  title: 'Network Partition Recovery',
                  category: 'Network',
                  steps: 7,
                  lastUsed: '3d ago',
                  autoRun: false,
                },
                {
                  title: 'Memory Leak Mitigation',
                  category: 'Performance',
                  steps: 4,
                  lastUsed: '5h ago',
                  autoRun: true,
                },
                {
                  title: 'Database Connection Pool Exhaustion',
                  category: 'Database',
                  steps: 6,
                  lastUsed: '1w ago',
                  autoRun: false,
                },
              ].map((playbook, i) => (
                <Card key={i} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Terminal className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{playbook.title}</span>
                          <p className="text-xs text-muted-foreground">
                            {playbook.category} • {playbook.steps} steps
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          {playbook.lastUsed}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${playbook.autoRun ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}
                        >
                          {playbook.autoRun ? 'Auto-run' : 'Manual'}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Run">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
