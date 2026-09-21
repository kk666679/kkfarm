import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TrpcProvider } from '@/trpc/provider';
import { Layout } from '@/components/layout/Layout';
import { AuthGuard } from '@/components/auth/AuthGuard';

// Admin Dashboard Pages
import OverviewPage from '@/pages/overview/OverviewPage';
import TenantsPage from '@/pages/tenants/TenantsPage';
import DevicesPage from '@/pages/devices/DevicesPage';
import WorkloadsPage from '@/pages/workloads/WorkloadsPage';
import BillingPage from '@/pages/billing/BillingPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import IntegrationsPage from '@/pages/integrations/IntegrationsPage';
import McpPage from '@/pages/mcp/McpPage';
import AuditPage from '@/pages/audit/AuditPage';
import SettingsPage from '@/pages/settings/SettingsPage';

// Partner Portal Pages (integrated)
// TODO: Import partner portal pages when consolidated
// import ApiKeysPage from '@/pages/api-keys/ApiKeysPage';
// import UsagePage from '@/pages/usage/UsagePage';
// import WebhooksPage from '@/pages/webhooks/WebhooksPage';
// import DocumentationPage from '@/pages/documentation/DocumentationPage';
// import { ApiExplorer } from '@/components/api-explorer';

export default function App() {
  return (
    <TrpcProvider>
      <BrowserRouter>
        <AuthGuard>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />

              {/* Admin Dashboard Routes */}
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/tenants" element={<TenantsPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/workloads" element={<WorkloadsPage />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/mcp" element={<McpPage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Partner Portal Routes (placeholder—implement after consolidation) */}
              {/* <Route path="/api-keys" element={<ApiKeysPage />} />
              <Route path="/usage" element={<UsagePage />} />
              <Route path="/webhooks" element={<WebhooksPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/api-explorer" element={<ApiExplorer />} /> */}
            </Routes>
          </Layout>
        </AuthGuard>
      </BrowserRouter>
    </TrpcProvider>
  );
}
