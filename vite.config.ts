import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': src('api-config/api-service'),
      '@asset': src('asset-config/asset-services/asset-inventory'),
      '@component': src('component-config/component-service'),
      '@context': src('context-config/context-services/context-provider'),
      '@layout': src('layout-config/layout-services'),
      '@page': src('page-config'),
      '@route': src('route-config/route-services'),
      '@type': src('type-config/type-service/type'),
      '@util': src('util-config/util-service'),
      '@': src(''),
    },
  },
  // Every class is already unique (pheakkornyMbm<Component><Part>), so keep the names as written.
  css: { modules: { generateScopedName: '[local]' } },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], charts: ['recharts'] },
      },
    },
  },
});
