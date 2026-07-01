import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // We register the service worker ourselves via the `virtual:pwa-register/react`
      // hook (see src/components/common/PwaStatus.tsx) so we can show custom
      // "Offline ready" / "Update available" toasts instead of the plugin's default script.
      injectRegister: null,
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'],
      manifest: {
        id: '/',
        name: 'Sudoku Prime',
        short_name: 'Sudoku Prime',
        description:
          'A premium Sudoku puzzle game with 10 difficulty levels, notes, hints, achievements, and full offline play.',
        lang: 'en',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        theme_color: '#5c3af0',
        background_color: '#0b0e1a',
        categories: ['games', 'puzzle', 'entertainment'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache every build artifact (JS, CSS, HTML, self-hosted font files, icons)
        // so the app is fully playable offline right after the first successful load.
        // Only woff2 is listed (not the legacy woff fallback) — every browser capable
        // of installing a PWA already supports woff2, so shipping woff would just
        // double the font payload in the precache for files that are never used.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        // Keep the service worker out of `vite dev` (HMR + SW caching don't mix well).
        // Use `npm run build && npm run preview` to test PWA/offline behavior.
        enabled: false,
      },
    }),
  ],
})
