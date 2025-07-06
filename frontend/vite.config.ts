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
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-vendor';
          }

          // Radix UI components - split into smaller chunks
          if (id.includes('@radix-ui')) {
            if (id.includes('dialog') || id.includes('dropdown') || id.includes('select')) {
              return 'ui-radix-interactive';
            }
            return 'ui-radix-core';
          }

          // TipTap editor - large library, separate chunk
          if (id.includes('@tiptap') || id.includes('prosemirror')) {
            return 'editor-tiptap';
          }

          // Animation library
          if (id.includes('framer-motion') || id.includes('motion-dom')) {
            return 'animation-vendor';
          }

          // State management
          if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
            return 'data-vendor';
          }

          // Utility libraries
          if (id.includes('class-variance-authority') || id.includes('tailwind-merge') || id.includes('lucide-react')) {
            return 'utils-vendor';
          }

          // Large node_modules packages
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    // PWA specific build options
    assetsInlineLimit: 4096, // Inline small assets for fewer requests
    minify: 'esbuild',
    chunkSizeWarningLimit: 500, // Warn for chunks larger than 500kB
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
