/**
 * Configurazione Sviluppo - Foundation Pack v1
 * 
 * Configurazione per modalità sviluppo e produzione
 * Gestisce mirroring onboarding e altre funzionalità dev
 * 
 * @version 1.0
 * @critical Architettura - Configurazione ambiente
 */

// ============================================================================
// CONFIGURAZIONE AMBIENTE
// ============================================================================

export interface DevConfig {
  mirrorOnboardingChanges: boolean
  enableDebugLogs: boolean
  enablePerformanceMonitoring: boolean
  enableHotReload: boolean
  enableMockData: boolean
  enableDevTools: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

// ============================================================================
// CONFIGURAZIONE DEFAULT
// ============================================================================

const DEFAULT_DEV_CONFIG: DevConfig = {
  mirrorOnboardingChanges: import.meta.env.DEV,
  enableDebugLogs: import.meta.env.DEV,
  enablePerformanceMonitoring: import.meta.env.DEV,
  enableHotReload: import.meta.env.DEV,
  enableMockData: false,
  enableDevTools: import.meta.env.DEV,
  logLevel: import.meta.env.DEV ? 'debug' : 'error'
}

// ============================================================================
// CONFIGURAZIONE PRODUZIONE
// ============================================================================

const PRODUCTION_CONFIG: DevConfig = {
  mirrorOnboardingChanges: false,
  enableDebugLogs: false,
  enablePerformanceMonitoring: false,
  enableHotReload: false,
  enableMockData: false,
  enableDevTools: false,
  logLevel: 'error'
}

// ============================================================================
// GESTIONE CONFIGURAZIONE
// ============================================================================

let currentConfig: DevConfig = DEFAULT_DEV_CONFIG

export const getDevConfig = (): DevConfig => {
  return { ...currentConfig }
}

export const setDevConfig = (config: Partial<DevConfig>): void => {
  currentConfig = { ...currentConfig, ...config }
  
  // Log della configurazione in dev
  if (import.meta.env.DEV) {
    console.log('🔧 Configurazione dev aggiornata:', currentConfig)
  }
}

export const resetDevConfig = (): void => {
  currentConfig = import.meta.env.DEV ? DEFAULT_DEV_CONFIG : PRODUCTION_CONFIG
}

export const isDevMode = (): boolean => {
  return import.meta.env.DEV
}

export const isProductionMode = (): boolean => {
  return import.meta.env.PROD
}

// ============================================================================
// CONFIGURAZIONI SPECIFICHE
// ============================================================================

export const getMirrorOnboardingChanges = (): boolean => {
  return currentConfig.mirrorOnboardingChanges
}

export const setMirrorOnboardingChanges = (enabled: boolean): void => {
  setDevConfig({ mirrorOnboardingChanges: enabled })
}

export const getDebugLogsEnabled = (): boolean => {
  return currentConfig.enableDebugLogs
}

export const setDebugLogsEnabled = (enabled: boolean): void => {
  setDevConfig({ enableDebugLogs: enabled })
}

export const getLogLevel = (): DevConfig['logLevel'] => {
  return currentConfig.logLevel
}

export const setLogLevel = (level: DevConfig['logLevel']): void => {
  setDevConfig({ logLevel: level })
}

// ============================================================================
// CONFIGURAZIONI PER FEATURE SPECIFICHE
// ============================================================================

export const getFormManagerConfig = () => {
  return {
    allowMultipleForms: false,
    autoSaveDraft: false,
    validateOnBlur: true,
    showFormConflicts: true
  }
}

export const getValidationConfig = () => {
  return {
    strictMode: currentConfig.logLevel === 'debug',
    showWarnings: currentConfig.enableDebugLogs,
    validateOnChange: true,
    validateOnSubmit: true
  }
}

export const getPersistenceConfig = () => {
  return {
    enableBackup: currentConfig.enableDebugLogs,
    enableMigrationLogs: currentConfig.enableDebugLogs,
    enableDataValidation: true,
    maxBackupCount: 5
  }
}

// ============================================================================
// UTILITY PER CONFIGURAZIONE DINAMICA
// ============================================================================

export const createConfigFromEnv = (): DevConfig => {
  const env = import.meta.env
  
  return {
    mirrorOnboardingChanges: env.DEV && env.VITE_MIRROR_ONBOARDING !== 'false',
    enableDebugLogs: env.DEV && env.VITE_DEBUG_LOGS !== 'false',
    enablePerformanceMonitoring: env.DEV && env.VITE_PERFORMANCE_MONITORING === 'true',
    enableHotReload: env.DEV && env.VITE_HOT_RELOAD !== 'false',
    enableMockData: env.VITE_MOCK_DATA === 'true',
    enableDevTools: env.DEV && env.VITE_DEV_TOOLS !== 'false',
    logLevel: (env.VITE_LOG_LEVEL as DevConfig['logLevel']) || (env.DEV ? 'debug' : 'error')
  }
}

// ============================================================================
// INIZIALIZZAZIONE
// ============================================================================

export const initializeDevConfig = (): void => {
  try {
    // Carica configurazione da environment variables
    const envConfig = createConfigFromEnv()
    currentConfig = envConfig
    
    // Carica configurazione salvata in localStorage (solo in dev)
    if (import.meta.env.DEV) {
      const savedConfig = localStorage.getItem('haccp-dev-config')
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig)
          currentConfig = { ...currentConfig, ...parsed }
        } catch (error) {
          console.warn('Errore nel parsing della configurazione salvata:', error)
        }
      }
    }
    
    console.log('🔧 Configurazione dev inizializzata:', currentConfig)
    
  } catch (error) {
    console.error('Errore nell\'inizializzazione della configurazione dev:', error)
    currentConfig = import.meta.env.DEV ? DEFAULT_DEV_CONFIG : PRODUCTION_CONFIG
  }
}

// ============================================================================
// PERSISTENZA CONFIGURAZIONE
// ============================================================================

export const saveDevConfig = (): void => {
  if (import.meta.env.DEV) {
    try {
      localStorage.setItem('haccp-dev-config', JSON.stringify(currentConfig))
    } catch (error) {
      console.warn('Errore nel salvataggio della configurazione:', error)
    }
  }
}

export const loadDevConfig = (): DevConfig | null => {
  if (import.meta.env.DEV) {
    try {
      const saved = localStorage.getItem('haccp-dev-config')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('Errore nel caricamento della configurazione:', error)
      return null
    }
  }
  return null
}

// ============================================================================
// RESET CONFIGURAZIONE
// ============================================================================

export const resetDevConfigToDefault = (): void => {
  currentConfig = import.meta.env.DEV ? DEFAULT_DEV_CONFIG : PRODUCTION_CONFIG
  
  if (import.meta.env.DEV) {
    localStorage.removeItem('haccp-dev-config')
    console.log('🔧 Configurazione dev resettata ai default')
  }
}
