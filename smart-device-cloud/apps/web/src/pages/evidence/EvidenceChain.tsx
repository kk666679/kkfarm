import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Hash,
} from 'lucide-react';
import { useState } from 'react';

export default function EvidenceChain() {
  const [activeTab, setActiveTab] = useState('chain');
  const [search, setSearch] = useState('');

  const evidence = [
    {
      id: 'EVT-2024-001',
      type: 'device_state_change',
      hash: 'a1b2c3d4e5f6...',
      timestamp: '2024-01-15T10:30:00Z',
      actor: 'system',
      verified: true,
      block: 124567,
    },
    {
      id: 'EVT-2024-002',
      type: 'workload_start',
      hash: 'b2c3d4e5f6a7...',
      timestamp: '2024-01-15T10:31:15Z',
      actor: 'agent-001',
      verified: true,
      block: 124568,
    },
    {
      id: 'EVT-2024-003',
      type: 'app_install',
      hash: 'c3d4e5f6a7b8...',
      timestamp: '2024-01-15T10:32:30Z',
      actor: 'agent-002',
      verified: true,
      block: 124569,
    },
    {
      id: 'EVT-2024-004',
      type: 'config_change',
      hash: 'd4e5f6a7b8c9...',
      timestamp: '2024-01-15T10:33:45Z',
      actor: 'admin-001',
      verified: true,
      block: 124570,
    },
    {
      id: 'EVT-2024-005',
      type: 'device_state_change',
      hash: 'e5f6a7b8c9d0...',
      timestamp: '2024-01-15T10:35:00Z',
      actor: 'system',
      verified: false,
      block: 124571,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evidence Chain</h1>
          <p className="text-muted-foreground">Immutable audit trail of all system events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Chain
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chain">Evidence Chain</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="chain" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search evidence..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <select className="rounded-lg border p-2 bg-background w-48">
              <option value="all">All Types</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="space-y-3">
            {evidence.map((entry, i) => (
              <Card key={entry.id} className={!entry.verified ? 'border-amber-500/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${entry.verified ? 'bg-green-500/10' : 'bg-amber-500/10'}`}
                      >
                        <Hash
                          className={`h-5 w-5 ${entry.verified ? 'text-green-500' : 'text-amber-500'}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-mono text-sm">{entry.id}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              entry.verified
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {entry.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{entry.type}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {entry.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 01-7 7h10a7 7 0 007-7z"
                              />
                            </svg>
                            {entry.actor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            Block #{entry.block}
                          </span>
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {entry.hash}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View Details">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Verify">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Audit Log</CardTitle>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search audit log..."
                  className="rounded-lg border p-2 w-64"
                />
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Audit log viewer coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    standard: 'SOC 2 Type II',
                    status: 'Compliant',
                    lastAudit: '2024-01-01',
                    nextAudit: '2025-01-01',
                    score: 98,
                  },
                  {
                    standard: 'ISO 27001',
                    status: 'Compliant',
                    lastAudit: '2023-12-01',
                    nextAudit: '2024-12-01',
                    score: 96,
                  },
                  {
                    standard: 'GDPR',
                    status: 'Compliant',
                    lastAudit: '2024-01-15',
                    nextAudit: '2024-07-15',
                    score: 99,
                  },
                  {
                    standard: 'HIPAA',
                    status: 'In Progress',
                    lastAudit: 'N/A',
                    nextAudit: '2024-06-01',
                    score: 78,
                  },
                ].map((comp, i) => (
                  <Card key={i} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{comp.standard}</span>
                          <p className="text-sm text-muted-foreground">
                            Last audit: {comp.lastAudit} • Next: {comp.nextAudit}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold">{comp.score}%</p>
                            <p className="text-xs text-muted-foreground">Compliance Score</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              comp.status === 'Compliant'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}
                          >
                            {comp.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
