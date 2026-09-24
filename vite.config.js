import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Guarda o "esqueleto" do app (JS/CSS/ícones) no aparelho, pra quando o
      // navegador recarregar a página sozinho (troca de app, minimizar) montar
      // a tela quase na hora em vez de baixar tudo de novo pela rede. Os dados
      // do paciente continuam vindo sempre do banco — nada disso fica em cache.
      registerType: 'autoUpdate',
      manifest: false, // usa o public/manifest.json existente, sem duplicar
      injectRegister: false, // registrado manualmente em src/main.jsx
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,woff,woff2}'],
        // O sprite SVG dos ícones Phosphor (~3MB) é só um fallback legado do
        // font-face — todo navegador moderno usa o .woff2 (bem menor), que já
        // fica no precache pelo globPattern acima. Sem isso o build do PWA
        // falha (excede o limite padrão de 2MB do Workbox) por um arquivo que
        // não é realmente necessário offline.
        globIgnores: ['**/Phosphor-*.svg'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hospital-assets-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-assets-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  base: './',
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            return 'vendor-libs'
          }
        },
      },
    },
  },
})

