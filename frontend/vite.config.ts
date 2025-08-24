import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "./src"),
    },
    dedupe: ['react', 'react-dom'], // Ensure single React instance
  },
  server: {
    port: 3000,
    host: true, // This allows external connections (0.0.0.0)
    strictPort: false, // Allow fallback to other ports if 3000 is busy
    allowedHosts: ['doaxvv.local'], // Allow doaxvv.local host
    proxy: {
      '/api': {
        target: env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          // Log proxy requests for debugging
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`🔄 Proxying ${req.method} ${req.url} to ${options.target}`);
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    copyPublicDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'tailwind-merge', 'class-variance-authority'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers'],
          'vendor-editor': ['@tiptap/core', '@tiptap/react', '@tiptap/starter-kit'],
          'vendor-query': ['@tanstack/react-query', 'axios'],
          'vendor-utils': ['zustand', 'nanoid']
        },
      },
    },
    assetsInlineLimit: 4096, // Inline small assets
    minify: 'esbuild',
    chunkSizeWarningLimit: 1000,
    target: 'esnext', // Modern browsers
    cssCodeSplit: true,
    // Enable tree shaking and compression
    emptyOutDir: true,
    reportCompressedSize: false, // Faster builds
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
  }
})
