import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PARTNER_PORT ?? 5175),
    strictPort: true,
    host: '0.0.0.0',
    preview: {
      port: Number(process.env.PARTNER_PREVIEW_PORT ?? 4175),
      strictPort: true,
      host: '0.0.0.0',
    },
  },
  build: { outDir: 'dist' },
});
