import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Ticket,
  MessageSquare,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Plus,
  Download,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Tag,
} from 'lucide-react';
import { useState } from 'react';

export default function TicketList() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const tickets = [
    {
      id: 'TKT-2024-001',
      title: 'Device offline after reboot',
      status: 'Open',
      priority: 'High',
      assignee: 'John D.',
      created: '2h ago',
      category: 'Device',
    },
    {
      id: 'TKT-2024-002',
      title: 'App install failing on Android 14',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Jane S.',
      created: '1h ago',
      category: 'Application',
    },
    {
      id: 'TKT-2024-003',
      title: 'Network latency spikes',
      status: 'Open',
      priority: 'Medium',
      assignee: 'Bob W.',
      created: '3h ago',
      category: 'Network',
    },
    {
      id: 'TKT-2024-004',
      title: 'App install timeout on iOS 17',
      status: 'Resolved',
      priority: 'Low',
      assignee: 'Alice B.',
      created: '1d ago',
      category: 'Application',
    },
    {
      id: 'TKT-2024-005',
      title: 'Device not provisioning',
      status: 'In Progress',
      priority: 'Critical',
      assignee: 'John D.',
      created: '30m ago',
      category: 'Device',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and track support requests</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="rounded-lg border p-2 bg-background"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-3">
        {tickets.map(ticket => (
          <Card key={ticket.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.priority === 'Critical' ? 'bg-red-500/10' : ticket.priority === 'High' ? 'bg-amber-500/10' : ticket.priority === 'Medium' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}
                  >
                    <Ticket
                      className={`h-5 w-5 ${ticket.priority === 'Critical' ? 'text-red-500' : ticket.priority === 'High' ? 'text-amber-500' : ticket.priority === 'Medium' ? 'text-blue-500' : 'text-green-500'}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono text-sm">{ticket.id}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          ticket.status === 'Open'
                            ? 'bg-blue-500/10 text-blue-500'
                            : ticket.status === 'In Progress'
                              ? 'bg-amber-500/10 text-amber-500'
                              : ticket.status === 'Resolved'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          ticket.priority === 'Critical'
                            ? 'bg-red-500/10 text-red-500'
                            : ticket.priority === 'High'
                              ? 'bg-amber-500/10 text-amber-500'
                              : ticket.priority === 'Medium'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-green-500/10 text-green-500'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{ticket.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.assignee}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {ticket.created}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="View">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z"
                      />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Reply">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
