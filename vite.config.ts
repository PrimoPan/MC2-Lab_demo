import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:2027',
      '/media': 'http://127.0.0.1:2027'
    }
  },
  build: {
    // Keep the established GitHub Actions packaging contract.
    outDir: 'build'
  }
});
