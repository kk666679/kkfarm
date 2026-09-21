import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield,
  KeyRound,
  Scale,
  Building,
  BadgeCheck,
  ToggleLeft,
  FlaskConical,
  PowerOff,
  Plus,
  Search,
  Filter,
  Key,
  Users,
  FileText,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminRoles() {
  const [activeTab, setActiveTab] = useState('roles');
  const [search, setSearch] = useState('');

  const roles = [
    {
      id: '1',
      name: 'Owner',
      description: 'Full access to all features and billing',
      users: 1,
      permissions: 45,
      color: 'bg-purple-500',
    },
    {
      id: '2',
      name: 'Admin',
      description: 'Full system access except billing',
      users: 3,
      permissions: 42,
      color: 'bg-purple-500',
    },
    {
      id: '3',
      name: 'Developer',
      description: 'Device and workflow management',
      users: 12,
      permissions: 28,
      color: 'bg-blue-500',
    },
    {
      id: '4',
      name: 'QA Engineer',
      description: 'Device testing and automation',
      users: 8,
      permissions: 22,
      color: 'bg-blue-500',
    },
    {
      id: '5',
      name: 'Viewer',
      description: 'Read-only access to dashboards',
      users: 15,
      permissions: 8,
      color: 'bg-gray-500',
    },
    {
      id: '6',
      name: 'Support',
      description: 'Support ticket management',
      users: 4,
      permissions: 12,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage role-based access control</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="space-y-3">
            {roles.map(role => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.color}/10`}
                      >
                        <Shield className={`h-6 w-6 ${role.color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                            {role.users} users
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{role.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {role.users} users
                          </span>
                          <span className="flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            {role.permissions} permissions
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Permissions">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate">
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
                            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-8M8 5l8 8m0 0l-8 8M8 5l-6 6"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600"
                        title="Delete"
                      >
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Manage granular permissions across all roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-2 pr-4 text-left font-medium w-48">Permission</th>
                      {['Owner', 'Admin', 'Developer', 'QA Engineer', 'Viewer', 'Support'].map(
                        role => (
                          <th key={role} className="pb-2 pr-4 text-center font-medium">
                            {role}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        category: 'Devices',
                        perms: [
                          'devices:read',
                          'devices:write',
                          'devices:delete',
                          'devices:provision',
                          'devices:control',
                          'devices:logs',
                        ],
                      },
                      {
                        category: 'Applications',
                        perms: [
                          'apps:read',
                          'apps:write',
                          'apps:install',
                          'apps:uninstall',
                          'apps:manage',
                        ],
                      },
                      {
                        category: 'Workflows',
                        perms: [
                          'workflows:read',
                          'workflows:write',
                          'workflows:execute',
                          'workflows:schedule',
                          'workflows:manage',
                        ],
                      },
                      {
                        category: 'Analytics',
                        perms: ['analytics:read', 'analytics:export', 'analytics:manage'],
                      },
                      {
                        category: 'Administration',
                        perms: [
                          'users:read',
                          'users:write',
                          'roles:read',
                          'roles:write',
                          'settings:read',
                          'settings:write',
                          'billing:read',
                          'billing:write',
                        ],
                      },
                    ].map(cat => (
                      <tr key={cat.category} className="border-t bg-muted/50">
                        <td className="py-2 pr-4 font-medium text-sm">{cat.category}</td>
                        {cat.perms.map((_, i) => (
                          <td key={i} className="py-2 text-center">
                            <Badge variant="default" className="w-full">
                              {'✓'}
                            </Badge>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Access Policies</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  name: 'Admin Full Access',
                  effect: 'Allow',
                  resources: ['*'],
                  conditions: 'role:admin',
                  priority: 1,
                },
                {
                  name: 'Developer Device Access',
                  effect: 'Allow',
                  resources: ['devices:*', 'workflows:*'],
                  conditions: 'role:developer',
                  priority: 10,
                },
                {
                  name: 'Viewer Read Only',
                  effect: 'Allow',
                  resources: ['*:read'],
                  conditions: 'role:viewer',
                  priority: 20,
                },
                {
                  name: 'Deny Billing Access',
                  effect: 'Deny',
                  resources: ['billing:*'],
                  conditions: 'role:developer,viewer',
                  priority: 5,
                },
                {
                  name: 'MFA Required for Admin',
                  effect: 'Deny',
                  resources: ['admin:*'],
                  conditions: '!mfa',
                  priority: 1,
                },
              ].map((policy, i) => (
                <Card key={i} className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{policy.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {policy.resources.join(', ')} • {policy.conditions}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${policy.effect === 'Allow' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}
                        >
                          {policy.effect}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-muted">
                          Priority: {policy.priority}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-600"
                        >
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
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
