import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 25_000_000,
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pips',
        short_name: 'Pips',
        display: 'fullscreen',
        description: 'A game of dominoes with a twist',
        background_color: '#fefef8',
        icons: [
          {
            src: '/pips-bg.svg',
            sizes:
              '48x48 72x72 96x96 120x120 128x128 144x144 180x180 256x256 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/pips-bg.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        theme_color: '#fefef8',
      },
    }),
  ],
  server: {
    port: 3000,
    host: '192.168.4.25',
  },
})
