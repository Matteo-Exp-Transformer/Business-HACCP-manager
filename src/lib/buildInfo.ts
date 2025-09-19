// Build information and version tracking
export interface BuildInfo {
  version: string
  buildTime: string
  gitCommit: string
  gitBranch: string
  environment: 'development' | 'staging' | 'production'
  buildNumber: string
  features: {
    clerkAuth: boolean
    supabaseDb: boolean
    sentryMonitoring: boolean
    offlineMode: boolean
    pwaEnabled: boolean
  }
}

// Get build info from environment variables and compile time
export const getBuildInfo = (): BuildInfo => {
  const now = new Date()
  
  return {
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    buildTime: import.meta.env.VITE_BUILD_TIME || now.toISOString(),
    gitCommit: import.meta.env.VITE_GIT_COMMIT || 'unknown',
    gitBranch: import.meta.env.VITE_GIT_BRANCH || 'unknown',
    environment: (import.meta.env.VITE_APP_ENV as BuildInfo['environment']) || 'development',
    buildNumber: import.meta.env.VITE_BUILD_NUMBER || '0',
    features: {
      clerkAuth: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && 
                 import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== 'pk_test_temp_development_key_for_demo',
      supabaseDb: !!import.meta.env.VITE_SUPABASE_URL,
      sentryMonitoring: !!import.meta.env.VITE_SENTRY_DSN,
      offlineMode: import.meta.env.VITE_OFFLINE_MODE === 'true',
      pwaEnabled: import.meta.env.VITE_PWA_ENABLED !== 'false',
    }
  }
}

// Development mode utilities
export const isDevelopment = () => import.meta.env.DEV
export const isProduction = () => import.meta.env.PROD
export const isStaging = () => import.meta.env.VITE_APP_ENV === 'staging'

// Feature flags
export const isFeatureEnabled = (feature: keyof BuildInfo['features']): boolean => {
  return getBuildInfo().features[feature]
}

// Debug info for console
export const logBuildInfo = () => {
  const buildInfo = getBuildInfo()
  
  console.group('🏗️ [BUILD INFO] Application Build Details')
  console.log('📦 Version:', buildInfo.version)
  console.log('🕐 Build Time:', buildInfo.buildTime)
  console.log('🌿 Git Branch:', buildInfo.gitBranch)
  console.log('📝 Git Commit:', buildInfo.gitCommit)
  console.log('🌍 Environment:', buildInfo.environment)
  console.log('🔢 Build Number:', buildInfo.buildNumber)
  console.log('🎛️ Features:', buildInfo.features)
  console.groupEnd()
  
  return buildInfo
}

// Version comparison utility
export const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0
    
    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }
  
  return 0
}

export default getBuildInfo