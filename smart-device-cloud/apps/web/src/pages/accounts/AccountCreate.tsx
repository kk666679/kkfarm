import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Shield, Key, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function AccountCreate() {
  const [activeTab, setActiveTab] = useState('basic');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted-foreground">Add a new user account to your organization</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input id="username" placeholder="johndoe" className="pl-7" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select className="w-full rounded-lg border p-2">
                  <option>Engineering</option>
                  <option>QA</option>
                  <option>DevOps</option>
                  <option>Product</option>
                  <option>Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" placeholder="Senior QA Engineer" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure authentication and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters with uppercase, lowercase, number, and special character
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requirePasswordChange"
                  className="rounded border-input"
                />
                <Label htmlFor="requirePasswordChange" className="font-normal cursor-pointer">
                  Require password change on first login
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="enableMFA" className="rounded border-input" />
                <Label htmlFor="enableMFA" className="font-normal cursor-pointer">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable Multi-Factor Authentication
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sendInvite" className="rounded border-input" checked />
                <Label htmlFor="sendInvite" className="font-normal cursor-pointer">
                  <Mail className="h-4 w-4 mr-2" />
                  Send invitation email with setup instructions
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Role & Permissions</CardTitle>
              <CardDescription>Assign role and configure access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full rounded-lg border p-2">
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="developer">Developer (Read/Write devices)</option>
                  <option value="admin">Admin (Full access)</option>
                  <option value="owner">Owner (Full access + billing)</option>
                </select>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Device Access</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>View devices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Control devices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Provision devices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Delete devices</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Manage device groups</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>View device logs</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Application Management</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>View applications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Install applications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Uninstall applications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Manage app versions</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Workflow & Automation</h4>
                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>View workflows</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Create workflows</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Execute workflows</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-input" />
                    <span>Manage schedules</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>Configure API keys and tokens</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="apiAccess" className="rounded border-input" />
                <Label htmlFor="apiAccess" className="font-normal cursor-pointer">
                  <Key className="h-4 w-4 mr-2" />
                  Enable API access
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">Rate Limit (requests/minute)</Label>
                <Input id="apiRateLimit" type="number" placeholder="100" value="60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiScopes">API Scopes</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'devices:read',
                    'devices:write',
                    'apps:read',
                    'apps:write',
                    'workflows:read',
                    'workflows:write',
                    'analytics:read',
                    'admin:read',
                  ].map(scope => (
                    <label key={scope} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-sm font-mono">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how and when to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  {[
                    {
                      id: 'device_alerts',
                      label: 'Device alerts (offline, errors)',
                      default: true,
                    },
                    { id: 'workflow_status', label: 'Workflow completion/failure', default: true },
                    { id: 'security_alerts', label: 'Security and access alerts', default: true },
                    {
                      id: 'billing_updates',
                      label: 'Billing and subscription updates',
                      default: true,
                    },
                    { id: 'weekly_reports', label: 'Weekly usage reports', default: false },
                    {
                      id: 'product_updates',
                      label: 'Product updates and announcements',
                      default: true,
                    },
                  ].map(notif => (
                    <label key={notif.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={notif.default}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{notif.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">In-App Notifications</h4>
                <div className="space-y-2">
                  {[
                    { id: 'in_app_device', label: 'Device status changes', default: true },
                    { id: 'in_app_workflow', label: 'Workflow events', default: true },
                    { id: 'in_app_security', label: 'Security events', default: true },
                    { id: 'in_app_mentions', label: 'Mentions and comments', default: true },
                  ].map(notif => (
                    <label key={notif.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={notif.default}
                        className="rounded border-input"
                      />
                      <span className="text-sm">{notif.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">Notification Frequency</h4>
                <div className="space-y-2">
                  <div className="space-y-2">
                    <Label>Digest Frequency</Label>
                    <select className="w-full max-w-xs rounded-lg border p-2">
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly digest</option>
                      <option value="daily" selected>
                        Daily digest
                      </option>
                      <option value="weekly">Weekly digest</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Start</Label>
                        <input
                          type="time"
                          className="w-32 rounded-lg border p-1"
                          defaultValue="22:00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">End</Label>
                        <input
                          type="time"
                          className="w-32 rounded-lg border p-1"
                          defaultValue="08:00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button variant="outline">Cancel</Button>
        <Button onClick={() => {}}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create Account
        </Button>
      </div>
    </div>
  );
}
