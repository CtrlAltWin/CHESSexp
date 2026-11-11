import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chess-api': {
        target: 'https://api.chess.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chess-api/, ''),
        headers: {
          'User-Agent': 'CHESSexp-Web-App (chess-explorer)'
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
});

