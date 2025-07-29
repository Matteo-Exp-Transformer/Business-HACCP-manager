import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'docs',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'asset/[name]-[hash].js',
        chunkFileNames: 'asset/[name]-[hash].js',
        assetFileNames: 'asset/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})