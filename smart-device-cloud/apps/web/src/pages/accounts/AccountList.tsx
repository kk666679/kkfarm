import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Shield, Key, Activity, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function AccountList() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage user accounts and access</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="space-y-4">
        {[
          {
            id: '1',
            name: 'John Doe',
            email: 'john@company.com',
            role: 'Admin',
            status: 'active',
            lastLogin: '2h ago',
            devices: 5,
          },
          {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@company.com',
            role: 'Developer',
            status: 'active',
            lastLogin: '1h ago',
            devices: 3,
          },
          {
            id: '3',
            name: 'Bob Wilson',
            email: 'bob@company.com',
            role: 'Viewer',
            status: 'inactive',
            lastLogin: '3 days ago',
            devices: 0,
          },
          {
            id: '4',
            name: 'Alice Brown',
            email: 'alice@company.com',
            role: 'Developer',
            status: 'active',
            lastLogin: '30m ago',
            devices: 2,
          },
        ].map(account => (
          <Card key={account.id} className="relative">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {account.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${account.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}
                      >
                        {account.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{account.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {account.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {account.devices} devices
                  </span>
                  <span>Last: {account.lastLogin}</span>
                </div>
                <div className="absolute right-4 top-4 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
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
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
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
