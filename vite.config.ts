import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LAS POS',
        short_name: 'LAS POS',
        description: 'Progressive Web App Point of Sale System',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.laspos\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/stores': path.resolve(__dirname, './src/stores')
    }
  },
  server: {
    port: 3000,
    host: true,
    open: '/index.html',
    proxy: {
      '/api/posapi-dev': {
        target: 'https://posapi.egretail-dev.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/posapi-dev/, '/api')
      },
      '/api/posapi-test': {
        target: 'https://posapi.egretail-test.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/posapi-test/, '/api')
      },
      '/api/posapi-prod': {
        target: 'https://posapi.egretail.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/posapi-prod/, '/api')
      },
      '/api/itemservice-dev': {
        target: 'https://itemservice-dev.egretail.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/itemservice-dev/, '/api')
      },
      '/api/itemservice-test': {
        target: 'https://itemservice-test.egretail.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/itemservice-test/, '/api')
      },
      '/api/itemservice-prod': {
        target: 'https://itemservice.egretail.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/itemservice-prod/, '/api')
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  }
})
