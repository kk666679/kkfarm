import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import {
  reservationService,
  type Reservation,
  type CreateReservationInput,
} from '@/services/reservation.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

export default function Reservations() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReservation, setNewReservation] = useState<CreateReservationInput>({
    deviceId: '',
    purpose: '',
    startTime: '',
    endTime: '',
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => reservationService.list(),
  });

  const createMutation = useMutation({
    mutationFn: reservationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      setIsCreateOpen(false);
      setNewReservation({ deviceId: '', purpose: '', startTime: '', endTime: '' });
      toast({
        title: 'Reservation Created',
        description: 'Your reservation has been created successfully',
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: reservationService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      toast({
        title: 'Reservation Cancelled',
        description: 'The reservation has been cancelled',
      });
    },
  });

  const getStatusVariant = (status: Reservation['status']) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleCreate = () => {
    if (!newReservation.deviceId || !newReservation.purpose) {
      toast({
        title: 'Invalid Input',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(newReservation);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">Manage device reservations and scheduling</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          New Reservation
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{reservations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">
              {reservations.filter(r => r.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">
              {reservations.filter(r => r.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">
              {reservations.filter(r => r.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading reservations...</p>
          ) : reservations.length === 0 ? (
            <p className="text-muted-foreground">No reservations found</p>
          ) : (
            <div className="space-y-4">
              {reservations.map(reservation => (
                <div
                  key={reservation.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reservation.deviceName}</span>
                      <Badge variant={getStatusVariant(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{reservation.purpose}</p>
                    <p className="text-xs text-muted-foreground">
                      Reserved by {reservation.userName} •{' '}
                      {new Date(reservation.startTime).toLocaleString()} -{' '}
                      {new Date(reservation.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelMutation.mutate(reservation.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
            <DialogDescription>Reserve a device for testing or development</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="device">Device</Label>
              <Select
                value={newReservation.deviceId}
                onValueChange={value =>
                  setNewReservation({ ...newReservation, deviceId: value ?? '' })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="device-1">Pixel 6</SelectItem>
                  <SelectItem value="device-2">Galaxy S21</SelectItem>
                  <SelectItem value="device-3">iPhone 14</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of this reservation"
                value={newReservation.purpose}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewReservation({ ...newReservation, purpose: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={newReservation.startTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewReservation({ ...newReservation, startTime: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={newReservation.endTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewReservation({ ...newReservation, endTime: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Reservation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
