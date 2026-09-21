import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '../..');
const webSource = path.resolve(repoRoot, 'apps/web/src');

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(repoRoot, 'public'),
  server: {
    port: Number(process.env.DEVICE_DASHBOARD_PORT ?? 5172),
    strictPort: true,
    host: '0.0.0.0',
    fs: {
      allow: [repoRoot],
    },
    proxy: {
      '/api': {
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
    alias: [
      { find: /^@\/(.*)$/, replacement: `${webSource}/$1` },
      {
        find: '@farms/api',
        replacement: path.resolve(repoRoot, 'apps/api/src/trpc/types.ts'),
      },
      {
        find: '@smart-device-cloud/shared',
        replacement: path.resolve(repoRoot, 'smart-device-cloud/shared/src/index.ts'),
      },
    ],
  },
});

