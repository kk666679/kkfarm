import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import type { Tenant } from '@/services/api';

export function useTenants() {
  return useQuery({
    queryKey: ['dashboard', 'tenants'],
    queryFn: () => cloudService.getTenants(),
  });
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['dashboard', 'tenant', id],
    queryFn: () => cloudService.getTenant(id),
    enabled: !!id,
  });
}

export type { Tenant };
