import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'

// Get git info for build
function getGitInfo() {
  try {
    return {
      commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim(),
    }
  } catch {
    return { commit: 'unknown', branch: 'unknown' }
  }
}

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  const git = getGitInfo()
  
  // Build number generation
  const buildNumber = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
  
  return {
    plugins: [react()],
    base: './',
    define: {
      // Inject build-time variables
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __GIT_COMMIT__: JSON.stringify(git.commit),
      __GIT_BRANCH__: JSON.stringify(git.branch),
      __BUILD_NUMBER__: JSON.stringify(buildNumber),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/utils': path.resolve(__dirname, './src/utils'),
      },
    },
    build: {
      outDir: 'docs',
      emptyOutDir: true,
      sourcemap: mode !== 'production',
      rollupOptions: {
        output: {
          entryFileNames: `asset/[name]-[hash].js`,
          chunkFileNames: `asset/[name]-[hash].js`,
          assetFileNames: `asset/[name]-[hash].[ext]`,
          manualChunks: {
            vendor: ['react', 'react-dom'],
            clerk: ['@clerk/clerk-react'],
            supabase: ['@supabase/supabase-js'],
            ui: ['lucide-react', 'zustand'],
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      cors: true,
    },
    preview: {
      port: 4173,
      host: true,
      cors: true,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@clerk/clerk-react', '@supabase/supabase-js']
    }
  }
})