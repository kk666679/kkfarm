import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router';
import ApiKeysPage from './pages/api-keys/ApiKeysPage';
import UsagePage from './pages/usage/UsagePage';
import DevicesPage from './pages/devices/DevicesPage';
import WebhooksPage from './pages/webhooks/WebhooksPage';
import DocumentationPage from './pages/documentation/DocumentationPage';
import { ApiExplorer } from './components/api-explorer';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 16, padding: 16, borderBottom: '1px solid #e5e7eb' }}>
        <NavLink to="/api-keys">API Keys</NavLink>
        <NavLink to="/usage">Usage</NavLink>
        <NavLink to="/devices">Devices</NavLink>
        <NavLink to="/webhooks">Webhooks</NavLink>
        <NavLink to="/docs">Documentation</NavLink>
        <NavLink to="/api-explorer">API Explorer</NavLink>
      </nav>
      <main style={{ padding: 24 }}>
        <Routes>
          <Route path="/api-keys" element={<ApiKeysPage />} />
          <Route path="/usage" element={<UsagePage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/webhooks" element={<WebhooksPage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/api-explorer" element={<ApiExplorer />} />
          <Route path="*" element={<ApiKeysPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
