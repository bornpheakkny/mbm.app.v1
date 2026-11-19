import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': src('api-root/api-config/api-service'),
      '@asset': src('asset-root/asset-config/asset-services/asset-inventory'),
      '@component': src('component-root/component-config/component-service'),
      '@context': src('context-root/context-config/context-services/context-provider'),
      '@layout': src('layout-root/layout-config/layout-services'),
      '@page': src('page-root/page-config'),
      '@route': src('route-root/route-config/route-services'),
      '@type': src('type/type-config/type-service/type'),
      '@util': src('utils/util-config/util-service'),
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
