'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, RefreshCw, ArrowUpDown, Star, Zap, CheckSquare, Filter, RotateCcw, Power, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeviceCard } from '@/components/devices/DeviceCard';
import { deviceService } from '@/services/device.service';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { DeviceGrid } from '@/components/devices/DeviceGrid';
import { DeviceTable } from '@/components/devices/DeviceTable';
import { DeviceFilters } from '@/components/devices/DeviceFilters';
import { DeviceRegistration } from '@/components/devices/DeviceRegistration';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

function DeviceCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
    />
  );
}

export default function DeviceListPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'battery'>('recent');
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [savedFilter, setSavedFilter] = useState<string>('all');

  const savedFilters = [
    { id: 'all', label: 'All Devices' },
    { id: 'available', label: 'Available' },
    { id: 'unhealthy', label: 'Unhealthy' },
    { id: 'failed-tasks', label: 'Failed Tasks' },
    { id: 'android14-offline', label: 'Android 14 Offline' },
    { id: 'idle', label: 'Idle' },
  ];

  const applySavedFilter = (id: string) => {
    setSavedFilter(id);
    switch (id) {
      case 'available':
        setFilters({ status: 'available' });
        break;
      case 'unhealthy':
        setFilters({ healthStatus: 'warning' });
        break;
      case 'failed-tasks':
        setFilters({ healthStatus: 'critical' });
        break;
      case 'android14-offline':
        setFilters({ status: 'offline' });
        break;
      case 'idle':
        setFilters({ status: 'available' });
        break;
      default:
        setFilters({});
    }
    setSelectedDevices(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedDevices.size === sorted.length && sorted.length > 0) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(sorted.map(d => d.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedDevices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkAction = (action: string) => {
    selectedDevices.forEach(deviceId => {
      deviceService.sendCommand(deviceId, action).catch(console.error);
    });
    setSelectedDevices(new Set());
  };

  const {
    data: devices,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ['devices', filters, sortBy],
    queryFn: () => deviceService.getDevices(filters),
    refetchInterval: 30000,
  });

  const filtered = useMemo(() => {
    if (!devices) return [];
    if (!filters.search) return devices;
    const q = filters.search.toLowerCase();
    return devices.filter(
      d =>
        d.name?.toLowerCase().includes(q) ||
        d.manufacturer?.toLowerCase().includes(q) ||
        d.model?.toLowerCase().includes(q)
    );
  }, [devices, filters.search]);

  const sorted = useMemo(() => {
    const sortedDevices = [...filtered];
    switch (sortBy) {
      case 'name':
        sortedDevices.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'battery':
        sortedDevices.sort((a, b) => (b.batteryLevel ?? 0) - (a.batteryLevel ?? 0));
        break;
      case 'recent':
      default:
        sortedDevices.sort(
          (a, b) =>
            new Date(b.lastSeen || '1970-01-01').getTime() -
            new Date(a.lastSeen || '1970-01-01').getTime()
        );
        break;
    }
    return sortedDevices;
  }, [filtered, sortBy]);

  const featuredDevices = sorted.slice(0, 3);
  const regularDevices = sorted.slice(3);

  const handleDeviceCommand = async (deviceId: string, command: string) => {
    try {
      await deviceService.sendCommand(deviceId, command);
      refetch();
    } catch (e) {
      console.error('Command failed', e);
    }
  };

  const allSelected = sorted.length > 0 && selectedDevices.size === sorted.length;

  return (
    <PageContainer>
      <PageHeader
        title="Device Operations"
        description="Find, inspect, and act on the real devices in your fleet"
        breadcrumbs={[{ label: 'Devices' }]}
        actions={[
          {
            label: 'Refresh',
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => refetch(),
          },
        ]}
      />

      {/* Saved Filter Presets */}
      <div className="mb-4 flex flex-wrap items-center gap-1">
        {savedFilters.map(preset => (
          <Button
            key={preset.id}
            variant={savedFilter === preset.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => applySavedFilter(preset.id)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border/70 bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In view</p>
          <p className="mt-1 text-2xl font-semibold">{sorted.length}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Connected</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900">
            {sorted.filter(device => ['online', 'active', 'ready'].includes(String(device.status).toLowerCase())).length}
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Needs attention</p>
          <p className="mt-1 text-2xl font-semibold text-amber-900">
            {sorted.filter(device => !['online', 'active', 'ready'].includes(String(device.status).toLowerCase())).length}
          </p>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedDevices.size > 0 && (
        <div
          className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-2"
          role="toolbar"
          aria-label="Bulk actions"
        >
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedDevices.size} selected</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm">
                  <Zap className="mr-1 h-4 w-4" /> Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => handleBulkAction('reboot')}>
                  <Power className="mr-2 h-4 w-4" /> Reboot
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('allocate')}>
                  <CheckSquare className="mr-2 h-4 w-4" /> Allocate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('drain')}>
                  <Filter className="mr-2 h-4 w-4" /> Drain
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('maintenance')}>
                  <Settings className="mr-2 h-4 w-4" /> Maintenance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('retry')}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retry Failed Tasks
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDevices(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <DeviceFilters
          filters={filters}
          onFilterChange={setFilters}
          viewMode={view}
          onViewModeChange={setView}
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1 border rounded-lg px-2 py-1">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <Select value={sortBy} onValueChange={(v: string | null) => setSortBy(v as any)}>
            <SelectTrigger className="h-8 w-auto border-0 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Seen</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="battery">Battery</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Register Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register Device</DialogTitle>
              </DialogHeader>
              <DeviceRegistration
                open={isRegisterOpen}
                onOpenChange={setIsRegisterOpen}
                onSuccess={() => {
                  setIsRegisterOpen(false);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          Failed to load devices: {(error as Error).message}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No devices found. Register your first device to get started.
        </div>
      ) : (
        <>
          {sorted.length > 3 && (
            <section className="mb-8" aria-label="Featured devices">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Devices
                </h2>
                {view === 'table' && (
                  <DeviceCheckbox
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all devices"
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredDevices.map(device => (
                  <div key={device.id} className="relative">
                    {view === 'grid' && (
                      <div className="absolute left-2 top-2 z-10">
                        <DeviceCheckbox
                          checked={selectedDevices.has(device.id)}
                          onChange={() => toggleSelectOne(device.id)}
                          aria-label={`Select ${device.name}`}
                        />
                      </div>
                    )}
                    <DeviceCard
                      device={device as any}
                      onDetailsClick={(d: any) => navigate(`/devices/${d.id}`)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section aria-label="All devices">
            {view === 'grid' ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">All Devices ({sorted.length})</h2>
                  <DeviceCheckbox
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all devices"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sorted.map(device => (
                    <div key={device.id} className="relative">
                      <div className="absolute left-2 top-2 z-10">
                        <DeviceCheckbox
                          checked={selectedDevices.has(device.id)}
                          onChange={() => toggleSelectOne(device.id)}
                          aria-label={`Select ${device.name}`}
                        />
                      </div>
                      <DeviceGrid
                        devices={[device]}
                        isLoading={false}
                        onDeviceCommand={handleDeviceCommand}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <DeviceTable
                devices={sorted}
                isLoading={isLoading}
                onDeviceCommand={handleDeviceCommand}
              />
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
