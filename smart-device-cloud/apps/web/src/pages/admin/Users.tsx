import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Shield,
  Key,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  UserCog,
  KeyRound,
  Scale,
  Building,
  BadgeCheck,
  ToggleLeft,
  FlaskConical,
  PowerOff,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '2h ago',
      mfa: true,
      permissions: ['all'],
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'Developer',
      status: 'Active',
      lastLogin: '1h ago',
      mfa: true,
      permissions: ['devices:read', 'devices:write', 'workflows:read'],
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'Viewer',
      status: 'Inactive',
      lastLogin: '3 days ago',
      mfa: false,
      permissions: ['devices:read'],
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@company.com',
      role: 'Developer',
      status: 'Active',
      lastLogin: '30m ago',
      mfa: true,
      permissions: ['devices:read', 'devices:write', 'apps:read'],
    },
    {
      id: '5',
      name: 'Charlie Davis',
      email: 'charlie@company.com',
      role: 'Admin',
      status: 'Active',
      lastLogin: '5m ago',
      mfa: true,
      permissions: ['all'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="viewer">Viewer</option>
          <option value="owner">Owner</option>
        </select>
      </div>

      <div className="space-y-4">
        {users.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          user.status === 'Active'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {user.status}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded bg-primary/10 text-primary`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    MFA: {user.mfa ? 'Enabled' : 'Disabled'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {user.permissions.length} permissions
                  </span>
                  <span>Last: {user.lastLogin}</span>
                </div>
                <div className="absolute right-4 top-4 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit">
                    <UserCog className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Permissions">
                    <Shield className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="API Keys">
                    <Key className="h-4 w-4" />
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
