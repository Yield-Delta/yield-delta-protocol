import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/frontend',
  build: {
    outDir: '../../dist/frontend',
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/frontend/index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@elizaos/core': path.resolve(__dirname, '../../core/src'),
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
