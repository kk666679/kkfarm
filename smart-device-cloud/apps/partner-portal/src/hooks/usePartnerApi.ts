import { useQuery } from '@tanstack/react-query';
import { PartnerSdkClient, type PartnerConfig } from '@sdc/sdk';
import type { Tenant } from '@/types/tenant';

export function usePartnerApi() {
  const client = new PartnerSdkClient({
    baseUrl: typeof window !== 'undefined' ? '' : 'http://localhost:3000',
    apiKey: 'partner-demo-key',
    partnerId: 'partner-1',
    partnerName: 'Acme Corp',
  });

  return client;
}

export function usePartnerDevices(partnerId?: string) {
  return useQuery({
    queryKey: ['partner', 'devices', partnerId],
    queryFn: async () => {
      const client = new PartnerSdkClient({
        baseUrl: '',
        apiKey: 'partner-demo-key',
        partnerId: partnerId ?? 'partner-1',
        partnerName: 'Acme Corp',
      });
      return client.getPartnerDevices();
    },
    enabled: !!partnerId,
  });
}

export function usePartnerUsage() {
  return useQuery({
    queryKey: ['partner', 'usage'],
    queryFn: async () => {
      const client = usePartnerApi();
      return client.getPartnerUsage();
    },
  });
}

export function usePartnerApiKeys() {
  return useQuery({
    queryKey: ['partner', 'api-keys'],
    queryFn: async () => {
      const client = usePartnerApi();
      return client.getApiKeys();
    },
  });
}

export function usePartnerTenants(): { data?: Tenant[]; isLoading: boolean } {
  return {
    data: [
      {
        id: '1',
        name: 'Acme Corp',
        plan: 'Enterprise',
        devices: 42,
        status: 'Active',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'TechFlow Inc',
        plan: 'Pro',
        devices: 18,
        status: 'Active',
        createdAt: '2024-03-22',
      },
      {
        id: '3',
        name: 'DataDriven LLC',
        plan: 'Enterprise',
        devices: 67,
        status: 'Active',
        createdAt: '2023-11-08',
      },
    ],
    isLoading: false,
  };
}

export { PartnerSdkClient, type PartnerConfig };
