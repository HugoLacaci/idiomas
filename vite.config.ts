/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// base relativa + HashRouter: funciona en https://<usuario>.github.io/<repo>/ sin 404.
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Yolanda · Inglés e italiano',
        short_name: 'Idiomas',
        description: 'Aprende inglés e italiano con lecciones cortas y muchos ejercicios.',
        theme_color: '#1D2B53',
        background_color: '#FAF7F0',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        lang: 'es',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // El núcleo se precachea; fotos y audio se guardan al usarlos (por unidad).
        globPatterns: ['**/*.{js,css,html,svg,woff2}', 'img/emoji/**/*.svg', 'pwa-*.png', 'apple-touch-icon.png'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/audio/'),
            handler: 'CacheFirst',
            options: { cacheName: 'audio', expiration: { maxEntries: 20000 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.includes('/img/') || url.pathname.includes('/gift/'),
            handler: 'CacheFirst',
            options: { cacheName: 'img', expiration: { maxEntries: 3000 } },
          },
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'data' },
          },
        ],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 900 },
  server: { host: true },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
