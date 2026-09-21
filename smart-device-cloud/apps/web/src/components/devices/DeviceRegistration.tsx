import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { deviceService } from '@/services/device.service';

interface DeviceRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeviceRegistration({ open, onOpenChange, onSuccess }: DeviceRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    serialNumber: '',
    provider: 'emulator',
    androidVersion: '',
    osVersion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await deviceService.createDevice({
        ...formData,
        status: 'available',
        healthStatus: 'healthy',
        batteryLevel: 100,
        temperature: 25,
        cpuUsage: 0,
        memoryUsage: 0,
        storageUsage: 0,
        lastSeen: new Date().toISOString(),
      });

      toast({
        title: 'Device Registered',
        description: `${formData.name} has been registered successfully`,
      });

      setFormData({
        name: '',
        model: '',
        serialNumber: '',
        provider: 'emulator',
        androidVersion: '',
        osVersion: '',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register device',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>Add a new device to your device farm</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Device Name</Label>
                <Input
                  id="name"
                  placeholder="Pixel 6"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Google Pixel 6"
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  placeholder="EMULATOR-5554"
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider ?? ''}
                  onValueChange={value => setFormData({ ...formData, provider: value ?? '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emulator">Emulator</SelectItem>
                    <SelectItem value="real">Real Device</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="androidVersion">Android Version</Label>
                <Input
                  id="androidVersion"
                  placeholder="13"
                  value={formData.androidVersion}
                  onChange={e => setFormData({ ...formData, androidVersion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="osVersion">OS Version</Label>
                <Input
                  id="osVersion"
                  placeholder="Android 13"
                  value={formData.osVersion}
                  onChange={e => setFormData({ ...formData, osVersion: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
