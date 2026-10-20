import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { WorkflowRoutes } from '@/pages/workflows';

/* ------------------------------------------------------------------ */
/*  Lazy-loaded pages                                                  */
/* ------------------------------------------------------------------ */
/*  Route-level code splitting keeps the initial bundle small.        */
/*  Each page becomes its own chunk, fetched on first navigation.     */
/* ------------------------------------------------------------------ */

const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const NotFound = lazy(() => import('@/pages/errors/NotFound').then(m => ({ default: m.NotFound })));
const Landing = lazy(() => import('@/pages/landing/landing'));

const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Analytics = lazy(() => import('@/pages/dashboard/Analytics'));
const Activity = lazy(() => import('@/pages/dashboard/Activity'));
const Alerts = lazy(() => import('@/pages/dashboard/Alerts'));

const DeviceList = lazy(() => import('@/pages/devices/DeviceList'));
const DeviceDashboard = lazy(() => import('@/pages/devices/DeviceDashboard'));
const DeviceDetail = lazy(() => import('@/pages/devices/DeviceDetail'));
const DeviceSession = lazy(() => import('@/pages/devices/DeviceSession'));

const FleetOverview = lazy(() => import('@/pages/fleet/FleetOverview'));
const AgentRegistry = lazy(() => import('@/pages/agents/AgentRegistry'));
const ContentLibrary = lazy(() => import('@/pages/content/ContentLibrary'));
const AccountList = lazy(() => import('@/pages/accounts/AccountList'));
const CostDashboard = lazy(() => import('@/pages/cost/CostDashboard'));
const Preferences = lazy(() => import('@/pages/settings/Preferences'));
const Reservations = lazy(() => import('@/pages/support/Reservations'));

/* ------------------------------------------------------------------ */
/*  Legacy / alias redirects                                           */
/* ------------------------------------------------------------------ */
/*  Old or external links route cleanly to their canonical targets.   */
/*  Kept in one table so the JSX stays readable and additions are      */
/*  one-liners.                                                        */
/* ------------------------------------------------------------------ */

interface LegacyRedirect {
  from: string;
  to: string;
}

const LEGACY_REDIRECTS: LegacyRedirect[] = [
  { from: '/sessions',    to: '/dashboard' },
  { from: '/tasks',       to: '/workflows' },
  { from: '/queue',       to: '/dashboard' },
  { from: '/assistant',   to: '/dashboard' },
  { from: '/health',      to: '/fleet' },
  { from: '/metrics',     to: '/dashboard/analytics' },
  { from: '/logs',        to: '/dashboard/activity' },
  { from: '/automations', to: '/workflows' },
  { from: '/schedules',   to: '/workflows' },
  { from: '/runs',        to: '/workflows' },
  { from: '/insights',    to: '/dashboard/analytics' },
  { from: '/activity',    to: '/dashboard/activity' },
];

/* ------------------------------------------------------------------ */
/*  Fallback shown while a lazy chunk is loading                       */
/* ------------------------------------------------------------------ */

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--text-muted, #8a93a8)',
        fontSize: '0.9rem',
        letterSpacing: '0.05em',
      }}
    >
      Loading…
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* ---------------------------------------------------- */}
        {/*  Public                                             */}
        {/* ---------------------------------------------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/" element={<Landing />} />

        {/* ---------------------------------------------------- */}
        {/*  Authenticated + laid out                           */}
        {/* ---------------------------------------------------- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
            <Route path="/dashboard/activity" element={<Activity />} />
            <Route path="/dashboard/alerts" element={<Alerts />} />

            {/* Devices */}
            <Route path="/devices" element={<DeviceList />} />
            <Route path="/devices/dashboard" element={<DeviceDashboard />} />
            <Route path="/devices/:id" element={<DeviceDetail />} />
            <Route path="/devices/:id/session" element={<DeviceSession />} />

            {/* Fleet */}
            <Route path="/fleet" element={<FleetOverview />} />

            {/* Agents */}
            <Route path="/agents" element={<AgentRegistry />} />

            {/* Content */}
            <Route path="/content" element={<ContentLibrary />} />

            {/* Accounts */}
            <Route path="/accounts" element={<AccountList />} />

            {/* Cost */}
            <Route path="/cost" element={<CostDashboard />} />

            {/* Settings */}
            <Route path="/settings" element={<Preferences />} />

            {/* Support */}
            <Route path="/support" element={<Reservations />} />

            {/* Workflows — nested router */}
            <Route path="/workflows/*" element={<WorkflowRoutes />} />

            {/* ---------------------------------------------- */}
            {/*  Legacy / alias redirects                      */}
            {/* ---------------------------------------------- */}
            {LEGACY_REDIRECTS.map(({ from, to }) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
