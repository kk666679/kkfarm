import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(import.meta.dirname, '../../public'),

  resolve: {
    alias: {
      '@':                  path.resolve(import.meta.dirname, './src'),
      '~':                  path.resolve(import.meta.dirname, './src'),
      '@smartcloud/api':    path.resolve(import.meta.dirname, '../services/api/src/public-api.ts'),
    },
  },

  build: {
    chunkSizeWarningLimit: 2000,
    // Nothing external here — this is an SPA, React must be bundled.
    // If you were building a *library*, you'd set:
    //   rollupOptions: { external: ['react', 'react-dom'] }
  },

  server: {
    port: Number(process.env.VITE_PORT ?? 5173),
    strictPort: process.env.VITE_STRICT_PORT === 'true',
    host: '0.0.0.0',
    open: false,               // ← no xdg-open in Codespaces/CI
    proxy: {
      '/trpc': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.VITE_WS_URL ?? 'ws://localhost:3000',
        ws: true,
      },
    },
  },

  preview: {
    port: Number(process.env.VITE_PREVIEW_PORT ?? 4173),
    strictPort: true,
    host: '0.0.0.0',
  },
});
