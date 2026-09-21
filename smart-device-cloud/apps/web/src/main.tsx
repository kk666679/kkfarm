import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider, Toaster } from '@/components/ui/toaster';
import { TRPCProvider } from './trpc/provider.tsx';
import { AuthInit } from './components/auth/AuthInit.tsx';
import { App } from './App.tsx';
import './index.css';

/**
 * Root bootstrap.
 *
 * Provider order (outside → inside):
 *   1. StrictMode        – React dev-time checks
 *   2. TRPCProvider      – typed data layer (must wrap anything that calls tRPC)
 *   3. AuthInit          – hydrates auth session; depends on tRPC
 *   4. ThemeProvider     – dark/light theme class on <html>
 *   5. ToastProvider     – toast queue + context
 *   6. TooltipProvider   – shared Radix tooltip context
 *   7. BrowserRouter     – client-side routing
 *   8. App               – application tree
 *   ─ Toaster            – rendered as a sibling to <App/> so it survives route changes
 */
const container = document.getElementById('root');

if (!container) {
  throw new Error(
    'Root element with id "root" not found. ' +
    'Make sure your index.html contains <div id="root"></div>.'
  );
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <TRPCProvider>
      <AuthInit>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <TooltipProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
              <Toaster />
            </TooltipProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthInit>
    </TRPCProvider>
  </React.StrictMode>
);
