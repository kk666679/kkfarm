import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.DASHBOARD_PORT ?? 5174),
    strictPort: true,
    host: '0.0.0.0',
    preview: {
      port: Number(process.env.DASHBOARD_PREVIEW_PORT ?? 4174),
    strictPort: process.env.VITE_STRICT_PORT === 'true',
      host: '0.0.0.0',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/trpc': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:5001',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, '../../shared/src'),
    },
  },
});
