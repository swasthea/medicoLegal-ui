import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'medicoLegalUI',
      filename: 'remoteEntry.js',
      exposes: {
        './routes': './src/app/router/federatedRoutes.tsx',
        './manifest': './src/app/manifest.ts',
      },
      shared: {
        react: { requiredVersion: '^19.1.0' },
        'react-dom': { requiredVersion: '^19.1.0' },
        'react-router-dom': { requiredVersion: '^7.6.0' },
        zustand: { requiredVersion: '^5.0.5' },
        '@tanstack/react-query': { requiredVersion: '^5.90.2' },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5176,
    proxy: {
      '/api/v1': {
        target: process.env.BACKEND_URL ?? 'http://127.0.0.1:8197',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
