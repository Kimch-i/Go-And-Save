import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // /Go-And-Save/ on GitHub Pages (set by the workflow), / everywhere else
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    // dev only: send /api calls to the Express server on port 3000
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
