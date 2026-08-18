import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * During development the API runs as a separate process on port 5000 and this
 * dev server proxies `/api` to it. That means the frontend always talks to a
 * relative `/api` path - in development via this proxy, in production because
 * Express serves the built bundle from the same origin - so no API URL needs to
 * be baked into the bundle.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
