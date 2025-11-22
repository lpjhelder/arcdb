import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Kronon/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'search': ['fuse.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true
  }
});
