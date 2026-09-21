'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  Plus,
  Trash2,
  Key,
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  History,
  MoreHorizontal,
  DollarSign,
  Zap,
  Sparkles,
  Server,
  Cloud,
  Layers,
  TrendingUp,
  Activity,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'crypto' | 'bank';
  last4: string;
  expiryDate?: string;
  brand?: string;
  isDefault: boolean;
  name: string;
  createdAt: string;
}

interface BYOKKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'expired' | 'revoked';
  usage: number;
  limit?: number;
  permissions: string[];
  models: string[];
}

interface Subscription {
  id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  features: string[];
  billingCycle: 'monthly' | 'yearly';
}

// BYOK Management Component
function BYOKManagement({
  keys,
  onAdd,
  onRemove,
  onUpdate,
}: {
  keys: BYOKKey[];
  onAdd: (key: BYOKKey) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: Partial<BYOKKey>) => void;
}) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<Partial<BYOKKey>>({
    name: '',
    provider: 'openai',
    key: '',
    permissions: ['read', 'write'],
    models: ['gpt-4', 'gpt-3.5-turbo'],
  });

  const providers = [
    { value: 'openai', label: 'OpenAI', icon: Sparkles, color: 'text-green-500' },
    { value: 'anthropic', label: 'Anthropic', icon: Zap, color: 'text-purple-500' },
    { value: 'google', label: 'Google AI', icon: Cloud, color: 'text-blue-500' },
    { value: 'azure', label: 'Azure OpenAI', icon: Server, color: 'text-cyan-500' },
    { value: 'custom', label: 'Custom', icon: Layers, color: 'text-orange-500' },
  ];

  const handleAddKey = () => {
    if (!newKey.name || !newKey.key || !newKey.provider) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const key: BYOKKey = {
      id: `key-${Date.now()}`,
      name: newKey.name,
      provider: newKey.provider as BYOKKey['provider'],
      key: newKey.key,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      status: 'active',
      usage: 0,
      limit: newKey.limit,
      permissions: newKey.permissions || ['read', 'write'],
      models: newKey.models || ['gpt-4', 'gpt-3.5-turbo'],
    };

    onAdd(key);
    setIsDialogOpen(false);
    setNewKey({
      name: '',
      provider: 'openai',
      key: '',
      permissions: ['read', 'write'],
      models: ['gpt-4', 'gpt-3.5-turbo'],
    });
    toast({
      title: 'API Key Added',
      description: `${key.name} has been added successfully`,
    });
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const getProviderIcon = (provider: string) => {
    const p = providers.find(p => p.value === provider);
    return p?.icon || Key;
  };

  const getStatusColor = (status: BYOKKey['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-500 bg-green-500/10';
      case 'expired':
        return 'text-red-500 bg-red-500/10';
      case 'revoked':
        return 'text-gray-500 bg-gray-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5" />
            BYOK - Bring Your Own Key
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your API keys for AI services. Your keys are encrypted and never shared.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add API Key
        </Button>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No API keys configured</p>
          <p className="text-sm text-muted-foreground">
            Add your own API keys for AI services to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map(key => {
            const ProviderIcon = getProviderIcon(key.provider);
            const provider = providers.find(p => p.value === key.provider);

            return (
              <Card key={key.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'rounded-lg p-2',
                          provider?.color.replace('text-', 'bg-') + '/10'
                        )}
                      >
                        <ProviderIcon className={cn('h-5 w-5', provider?.color)} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{key.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {key.provider}
                          </Badge>
                          <Badge className={cn('text-xs', getStatusColor(key.status))}>
                            {key.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {showKey[key.id] ? key.key : '•'.repeat(32)}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKey[key.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => copyKey(key.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                          <span>Last used: {new Date(key.lastUsed).toLocaleDateString()}</span>
                          <span>Usage: {key.usage} requests</span>
                          {key.limit && <span>Limit: {key.limit} req/month</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-auto sm:ml-0">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant="outline" size="sm">
                              <Shield className="h-3 w-3 mr-1" />
                              Test
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Test API key connectivity</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onUpdate(key.id, { status: 'revoked' })}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Revoke
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdate(key.id, { status: 'active' })}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onRemove(key.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Key Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add API Key</DialogTitle>
            <DialogDescription>
              Add your own API key for AI services. Your key will be encrypted and stored securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Key Name</Label>
              <Input
                placeholder="My OpenAI Key"
                value={newKey.name}
                onChange={e => setNewKey({ ...newKey, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Provider</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {providers.map(p => (
                  <Button
                    key={p.value}
                    variant={newKey.provider === p.value ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setNewKey({ ...newKey, provider: p.value as any })}
                  >
                    <p.icon className={cn('h-4 w-4 mr-2', p.color)} />
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showKey['new'] ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={newKey.key}
                  onChange={e => setNewKey({ ...newKey, key: e.target.value })}
                  className="pr-20 font-mono"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 px-3"
                  onClick={() => setShowKey({ ...showKey, new: !showKey['new'] })}
                >
                  {showKey['new'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your key will be encrypted and never shared with third parties.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Monthly Usage Limit (Optional)</Label>
              <Input
                type="number"
                placeholder="100000"
                value={newKey.limit || ''}
                onChange={e =>
                  setNewKey({ ...newKey, limit: parseInt(e.target.value) || undefined })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex flex-wrap gap-2">
                {['read', 'write', 'delete', 'admin'].map(perm => (
                  <Badge
                    key={perm}
                    variant={newKey.permissions?.includes(perm) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const perms = newKey.permissions || [];
                      setNewKey({
                        ...newKey,
                        permissions: perms.includes(perm)
                          ? perms.filter(p => p !== perm)
                          : [...perms, perm],
                      });
                    }}
                  >
                    {perm}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Models</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  'gpt-4',
                  'gpt-4-turbo',
                  'gpt-3.5-turbo',
                  'claude-3',
                  'claude-3-opus',
                  'gemini-pro',
                ].map(model => (
                  <Badge
                    key={model}
                    variant={newKey.models?.includes(model) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const models = newKey.models || [];
                      setNewKey({
                        ...newKey,
                        models: models.includes(model)
                          ? models.filter(m => m !== model)
                          : [...models, model],
                      });
                    }}
                  >
                    {model}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddKey}>
              <Plus className="mr-2 h-4 w-4" />
              Add API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Payment Methods Component
function PaymentMethods({
  methods,
  onAdd,
  onRemove,
  onSetDefault,
}: {
  methods: PaymentMethod[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onSetDefault: (id: string) => void;
}) {
  const getCardIcon = (brand?: string) => {
    const icons: Record<string, any> = {
      visa: CreditCard,
      mastercard: CreditCard,
      amex: CreditCard,
      discover: CreditCard,
    };
    return icons[brand?.toLowerCase() || ''] || CreditCard;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods for subscriptions
          </p>
        </div>
        <Button onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No payment methods added</p>
          <p className="text-sm text-muted-foreground">
            Add a payment method to start your subscription
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map(method => {
            const Icon = getCardIcon(method.brand);
            return (
              <div
                key={method.id}
                className={cn(
                  'flex items-center justify-between p-4 border rounded-lg',
                  method.isDefault && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-muted p-2">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {method.type === 'card'
                          ? `${method.brand || 'Card'} ending in ${method.last4}`
                          : method.type}
                      </span>
                      {method.isDefault && (
                        <Badge variant="default" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    {method.expiryDate && (
                      <p className="text-sm text-muted-foreground">Expires {method.expiryDate}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Added {new Date(method.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => onSetDefault(method.id)}>
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onRemove(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Subscription Management Component
function SubscriptionManagement({
  subscription,
  onUpgrade,
  onCancel,
  onRenew,
}: {
  subscription: Subscription;
  onUpgrade: (plan: string) => void;
  onCancel: () => void;
  onRenew: () => void;
}) {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['10 API calls/day', 'Basic support', '1 device'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: ['10,000 API calls/month', 'Priority support', '10 devices', 'Advanced analytics'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      features: [
        'Unlimited API calls',
        '24/7 support',
        '100+ devices',
        'Custom integrations',
        'Dedicated account manager',
      ],
    },
  ];

  const currentPlan = plans.find(p => p.id === subscription.plan);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Subscription
          </h3>
          <p className="text-sm text-muted-foreground">Manage your subscription plan and billing</p>
        </div>
        <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
          {subscription.status}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold capitalize">{subscription.plan}</p>
              <p className="text-sm text-muted-foreground">
                ${subscription.price}/{subscription.billingCycle}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {currentPlan?.features.map((feature, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onRenew}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Renew
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full sm:w-auto"
                onClick={onCancel}
              >
                <XCircle className="mr-2 h-3 w-3" />
                Cancel Subscription
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card
            key={plan.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg',
              subscription.plan === plan.id && 'border-primary ring-2 ring-primary/20'
            )}
            onClick={() => onUpgrade(plan.id)}
          >
            <CardHeader>
              <CardTitle className="text-sm">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">${plan.price}</span>
                {plan.price > 0 && (
                  <span className="text-sm text-muted-foreground">
                    /{subscription.billingCycle}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-xs flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={subscription.plan === plan.id ? 'default' : 'outline'}
                className="w-full"
                disabled={subscription.plan === plan.id}
              >
                {subscription.plan === plan.id ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Billing History Component
function BillingHistory({ history }: { history: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5" />
            Billing History
          </h3>
          <p className="text-sm text-muted-foreground">View and download your billing history</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-3 w-3" />
          Export All
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No billing history</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {item.type === 'invoice' ? 'Invoice' : 'Payment'}
                      </span>
                      <Badge variant={item.status === 'paid' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()} • {item.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">${item.amount}</span>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Usage Metrics Component
function UsageMetrics({ usage }: { usage: any }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Usage Metrics
        </h3>
        <p className="text-sm text-muted-foreground">Monitor your API usage and limits</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">API Calls</p>
            <p className="text-2xl font-bold">{usage.apiCalls || 0}</p>
            <p className="text-xs text-muted-foreground">This month</p>
            <Progress value={70} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Cost</p>
            <p className="text-2xl font-bold">${usage.cost || 0}</p>
            <p className="text-xs text-muted-foreground">This month</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Limit</p>
            <p className="text-2xl font-bold">{usage.limit || 'Unlimited'}</p>
            <p className="text-xs text-muted-foreground">Monthly limit</p>
            {usage.limit && (
              <Progress value={(usage.apiCalls / usage.limit) * 100} className="mt-2" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Billing Component
export default function Billing() {
  const { toast } = useToast();
  const [, setActiveTab] = useState('overview');
  const [, setIsAddPaymentOpen] = useState(false);

  // Mock data
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      expiryDate: '12/25',
      brand: 'Visa',
      isDefault: true,
      name: 'Business Card',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'pm_2',
      type: 'card',
      last4: '8888',
      expiryDate: '06/26',
      brand: 'Mastercard',
      isDefault: false,
      name: 'Personal Card',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [apiKeys, setApiKeys] = useState<BYOKKey[]>([
    {
      id: 'key_1',
      name: 'OpenAI Production',
      provider: 'openai',
      key: 'sk-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      status: 'active',
      usage: 4567,
      limit: 100000,
      permissions: ['read', 'write'],
      models: ['gpt-4', 'gpt-3.5-turbo'],
    },
    {
      id: 'key_2',
      name: 'Anthropic Research',
      provider: 'anthropic',
      key: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      status: 'active',
      usage: 1234,
      limit: 50000,
      permissions: ['read'],
      models: ['claude-3', 'claude-3-opus'],
    },
  ]);

  const [subscription, setSubscription] = useState<Subscription>({
    id: 'sub_1',
    plan: 'pro',
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    price: 29,
    currency: 'USD',
    features: ['10,000 API calls/month', 'Priority support', '10 devices', 'Advanced analytics'],
    billingCycle: 'monthly',
  });

  const [billingHistory] = useState([
    {
      type: 'invoice',
      status: 'paid',
      date: new Date().toISOString(),
      amount: 29,
      description: 'Monthly subscription',
    },
    {
      type: 'payment',
      status: 'paid',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 29,
      description: 'Monthly subscription',
    },
  ]);

  const [usage] = useState({
    apiCalls: 7234,
    cost: 12.45,
    limit: 10000,
  });

  // Handlers
  const handleAddPayment = () => {
    setIsAddPaymentOpen(true);
    // Mock adding payment
    setTimeout(() => {
      setIsAddPaymentOpen(false);
      toast({
        title: 'Payment Method Added',
        description: 'Your payment method has been added successfully',
      });
    }, 1500);
  };

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    toast({
      title: 'Payment Method Removed',
      description: 'Payment method has been removed',
    });
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(methods => methods.map(m => ({ ...m, isDefault: m.id === id })));
    toast({
      title: 'Default Payment Method Updated',
      description: 'Default payment method has been updated',
    });
  };

  const handleAddKey = (key: BYOKKey) => {
    setApiKeys(keys => [...keys, key]);
  };

  const handleRemoveKey = (id: string) => {
    setApiKeys(keys => keys.filter(k => k.id !== id));
    toast({
      title: 'API Key Removed',
      description: 'API key has been removed',
    });
  };

  const handleUpdateKey = (id: string, data: Partial<BYOKKey>) => {
    setApiKeys(keys => keys.map(k => (k.id === id ? { ...k, ...data } : k)));
    toast({
      title: 'API Key Updated',
      description: 'API key has been updated',
    });
  };

  const handleUpgrade = (plan: string) => {
    setSubscription(sub => ({ ...sub, plan: plan as any }));
    toast({
      title: 'Plan Upgraded',
      description: `Successfully upgraded to ${plan} plan`,
    });
  };

  const handleCancel = () => {
    setSubscription(sub => ({ ...sub, status: 'canceled' }));
    toast({
      title: 'Subscription Canceled',
      description: 'Your subscription has been canceled',
      variant: 'destructive',
    });
  };

  const handleRenew = () => {
    setSubscription(sub => ({ ...sub, status: 'active' }));
    toast({
      title: 'Subscription Renewed',
      description: 'Your subscription has been renewed',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 sm:h-8 sm:w-8" />
          Billing & Subscription
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your subscription, payment methods, and API keys
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="byok">BYOK</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subscription */}
          <SubscriptionManagement
            subscription={subscription}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
            onRenew={handleRenew}
          />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Cost</p>
                  <p className="text-xl font-bold">${subscription.price}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-green-500/10 p-2">
                  <Key className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Keys</p>
                  <p className="text-xl font-bold">{apiKeys.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Methods</p>
                  <p className="text-xl font-bold">{paymentMethods.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="rounded-lg bg-yellow-500/10 p-2">
                  <Activity className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">API Usage</p>
                  <p className="text-xl font-bold">{usage.apiCalls.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <PaymentMethods
            methods={paymentMethods}
            onAdd={handleAddPayment}
            onRemove={handleRemovePayment}
            onSetDefault={handleSetDefaultPayment}
          />
        </TabsContent>

        <TabsContent value="byok">
          <BYOKManagement
            keys={apiKeys}
            onAdd={handleAddKey}
            onRemove={handleRemoveKey}
            onUpdate={handleUpdateKey}
          />
        </TabsContent>

        <TabsContent value="history">
          <BillingHistory history={billingHistory} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageMetrics usage={usage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
