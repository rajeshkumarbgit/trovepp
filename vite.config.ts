import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward the enquiry form to PHP's built-in server (`npm run php`)
    proxy: {
      '/enquiry.php': 'http://localhost:8000',
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
});
