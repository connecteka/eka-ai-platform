import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '.emergentagent.com',
      '.preview.emergentagent.com',
      '.preview.emergentcf.cloud',
      'code-creator-129.preview.emergentagent.com',
      'code-creator-129.cluster-5.preview.emergentcf.cloud'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
});
