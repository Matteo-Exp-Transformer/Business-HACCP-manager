/**
 * Sistema di debug per controllare i log in produzione
 */

// Flag di debug - può essere controllato da variabili d'ambiente o localStorage
const DEBUG = process.env.NODE_ENV === 'development' || 
              localStorage.getItem('haccp:debug') === 'true' ||
              window.location.search.includes('debug=true')

// Flag per ridurre la verbosità dei log dell'AIAssistant
const AIASSISTANT_VERBOSE = localStorage.getItem('haccp:ai-assistant-verbose') === 'true'

/**
 * Logger condizionale che stampa solo se DEBUG è true
 */
export const debugLog = (...args) => {
  if (DEBUG) {
    console.log(...args)
  }
}

/**
 * Logger per AIAssistant che stampa solo se DEBUG è true E AIASSISTANT_VERBOSE è true
 */
export const aiAssistantLog = (...args) => {
  if (DEBUG && AIASSISTANT_VERBOSE) {
    console.log(...args)
  }
}

/**
 * Logger per errori che stampa sempre (anche in produzione)
 */
export const errorLog = (...args) => {
  console.error(...args)
}

/**
 * Logger per warning che stampa sempre (anche in produzione)
 */
export const warnLog = (...args) => {
  console.warn(...args)
}

/**
 * Logger per info che stampa solo se DEBUG è true
 */
export const infoLog = (...args) => {
  if (DEBUG) {
    console.info(...args)
  }
}

/**
 * Logger per debug specifico di HACCP
 */
export const haccpLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`🔍 HACCP: ${message}`, data || '')
  }
}

/**
 * Logger per debug di temperatura
 */
export const tempLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`🌡️ TEMP: ${message}`, data || '')
  }
}

/**
 * Logger per debug di manutenzione
 */
export const maintenanceLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`🔧 MAINT: ${message}`, data || '')
  }
}

/**
 * Logger per debug di migrazione dati
 */
export const migrationLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`🔄 MIGRATE: ${message}`, data || '')
  }
}

/**
 * Logger per debug di validazione
 */
export const validationLog = (message, data = null) => {
  if (DEBUG) {
    console.log(`✅ VALID: ${message}`, data || '')
  }
}

/**
 * Abilita/disabilita il debug in runtime
 */
export const setDebug = (enabled) => {
  if (enabled) {
    localStorage.setItem('haccp:debug', 'true')
  } else {
    localStorage.removeItem('haccp:debug')
  }
  // Ricarica la pagina per applicare le modifiche
  window.location.reload()
}

/**
 * Controlla se il debug è abilitato
 */
export const isDebugEnabled = () => DEBUG

export default {
  debugLog,
  aiAssistantLog,
  errorLog,
  warnLog,
  infoLog,
  haccpLog,
  tempLog,
  maintenanceLog,
  migrationLog,
  validationLog,
  setDebug,
  isDebugEnabled
}
