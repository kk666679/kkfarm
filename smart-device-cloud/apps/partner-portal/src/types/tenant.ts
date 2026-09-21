export interface Tenant {
  id: string;
  name: string;
  plan: string;
  devices: number;
  status: 'Active' | 'Suspended';
  createdAt: string;
}
