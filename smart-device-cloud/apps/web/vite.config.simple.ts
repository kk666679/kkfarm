import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist-simple',
  },
  server: {
    port: 5173,
    strictPort: false,
    host: '0.0.0.0',
  },
});
