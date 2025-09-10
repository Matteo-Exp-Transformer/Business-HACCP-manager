import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Forza modalità sviluppo per il branch main-precompilato
  const isMainPrecompilato = process.env.VERCEL_GIT_COMMIT_REF === 'main-precompilato' || 
                            process.env.GITHUB_REF === 'refs/heads/main-precompilato' ||
                            process.env.BRANCH === 'main-precompilato';
  
  return {
    plugins: [react()],
    base: './',
    define: {
      'process.env.NODE_ENV': isMainPrecompilato ? '"development"' : JSON.stringify(mode || 'production')
    },
    build: {
      outDir: 'docs',
      emptyOutDir: true,
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
  }
})