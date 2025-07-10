import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'logo.png', 'icons/*.png'],
      manifest: {
        name: 'Handbook',
        short_name: 'Handbook',
        description: 'Your comprehensive handbook - a digital companion for personal growth, knowledge, and daily guidance',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
    dedupe: ['react', 'react-dom'], // Ensure single React instance
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    // PWA Configuration
    copyPublicDir: true,
    rollupOptions: {
      output: {
        // Remove manual chunks to avoid vendor file issues
        manualChunks: undefined
      }
    },
    // PWA specific build options
    assetsInlineLimit: 4096, // Inline small assets for fewer requests
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000, // Increase warning limit since we're not splitting chunks
    target: 'esnext', // Modern browsers for better optimization
    cssCodeSplit: true, // Split CSS for better caching
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'zustand',
      'tailwind-merge',
      'class-variance-authority',
      'react-hook-form',
      'zod',
      '@hookform/resolvers/zod',
    ],
    force: true, // Force re-optimization to ensure React 19 compatibility
  },
  define: {
    'process.env': {},
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
}) 
