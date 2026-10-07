import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Khi chạy dev, chuyển mọi request /api sang server Express
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
