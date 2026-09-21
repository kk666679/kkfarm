'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Play, Pause, Settings, Trash2, Info, Users, Calendar } from 'lucide-react';
import type { Device } from '@smart-device-cloud/shared';
import { useDeviceStore } from '@/store/device.store';
import { useToast } from '@/components/ui/use-toast';
import { StatusIndicator } from './StatusIndicator';
import { formatDistanceToNow } from 'date-fns';

interface DeviceActionsProps {
  device: Device;
  onCommand: (deviceId: string, command: string, payload?: any) => void;
}

export function DeviceActions({ device, onCommand }: DeviceActionsProps) {
  const { removeDevice } = useDeviceStore();
  const { toast } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const batteryLevel = device.batteryLevel ?? 0;
  const lastSeen = device.lastSeen ? new Date(device.lastSeen) : new Date();

  const handleAction = async (action: string, payload?: any) => {
    try {
      switch (action) {
        case 'allocate':
          onCommand(device.id, 'allocate', payload);
          toast({
            title: 'Device Allocated',
            description: `${device.name} has been allocated`,
          });
          break;
        case 'release':
          onCommand(device.id, 'release');
          toast({
            title: 'Device Released',
            description: `${device.name} has been released`,
          });
          break;
        case 'maintenance':
          onCommand(device.id, 'maintenance', payload);
          toast({
            title: 'Maintenance Started',
            description: `${device.name} is in maintenance mode`,
          });
          break;
        case 'reboot':
          onCommand(device.id, 'reboot');
          toast({
            title: 'Rebooting Device',
            description: `${device.name} is rebooting`,
          });
          break;
        case 'delete':
          removeDevice(device.id);
          toast({
            title: 'Device Deleted',
            description: `${device.name} has been removed`,
            variant: 'destructive',
          });
          setIsDeleteOpen(false);
          break;
      }
    } catch (error) {
      toast({
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsActionOpen(true)}>
            <Info className="mr-2 h-4 w-4" />
            Details
          </DropdownMenuItem>

          {device.status === 'available' && (
            <DropdownMenuItem onClick={() => handleAction('allocate')}>
              <Users className="mr-2 h-4 w-4" />
              Allocate
            </DropdownMenuItem>
          )}

          {device.status === 'in_use' && (
            <DropdownMenuItem onClick={() => handleAction('release')}>
              <Play className="mr-2 h-4 w-4" />
              Release
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => handleAction('maintenance')}>
            <Settings className="mr-2 h-4 w-4" />
            Maintenance
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => handleAction('reboot')}>
            <Pause className="mr-2 h-4 w-4" />
            Reboot
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => handleAction('reserve')}>
            <Calendar className="mr-2 h-4 w-4" />
            Reserve
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {device.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction('delete')}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{device.name}</DialogTitle>
            <DialogDescription>Device details and status information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Model</p>
                <p className="font-medium">{device.model}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Serial</p>
                <p className="font-medium font-mono text-sm">{device.serialNumber}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">OS Version</p>
                <p className="font-medium">{device.osVersion || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusIndicator status={device.status} />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Health</p>
                <Badge
                  variant={
                    device.healthStatus === 'healthy'
                      ? 'default'
                      : device.healthStatus === 'warning'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {device.healthStatus}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="font-medium">
                  {formatDistanceToNow(lastSeen, {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Metrics</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Battery</p>
                  <p className="text-2xl font-bold">{batteryLevel}%</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold">{device.temperature}°C</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">CPU</p>
                  <p className="text-2xl font-bold">{device.cpuUsage}%</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Memory</p>
                  <p className="text-2xl font-bold">{device.memoryUsage}%</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
