import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200
  },
  test: {
    environment: 'node',
    globals: true
  }
} as any);
