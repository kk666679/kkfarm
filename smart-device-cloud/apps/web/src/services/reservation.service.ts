import { buildApiUrl } from '@/lib/api';

export interface Reservation {
  id: string;
  deviceId: string;
  deviceName: string;
  userId: string;
  userName: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
}

export interface CreateReservationInput {
  deviceId: string;
  purpose: string;
  startTime: string;
  endTime: string;
}

export const reservationService = {
  async list(): Promise<Reservation[]> {
    const res = await fetch(buildApiUrl('/devices'));
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
  },

  async create(input: CreateReservationInput): Promise<Reservation> {
    const res = await fetch(buildApiUrl('/devices'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create reservation');
    return res.json();
  },

  async cancel(id: string): Promise<void> {
    const res = await fetch(buildApiUrl(`/devices/${id}`), { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to cancel reservation');
  },
};
