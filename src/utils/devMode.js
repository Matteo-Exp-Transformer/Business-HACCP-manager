/**
 * Dev Mode - Gestione modalità sviluppo per testing e sviluppo
 * 
 * Questo file gestisce:
 * 1. Flag modalità sviluppo (URL ?dev=1 o localStorage)
 * 2. Bypass onboarding durante sviluppo
 * 3. Funzionalità debug aggiuntive
 * 4. Banner "DEV MODE" visibile
 * 
 * @version 1.0
 * @critical Sviluppo - Modalità testing
 */

// Chiave per localStorage
const DEV_MODE_KEY = 'haccp-dev-mode'

// Funzione per verificare se la modalità dev è attiva
export const isDevMode = () => {
  // Controlla localStorage
  try {
    const devMode = localStorage.getItem(DEV_MODE_KEY)
    if (devMode && devMode !== 'undefined' && devMode !== 'null' && devMode !== '[object Object]') {
      // Prova a parsare come JSON
      const parsed = JSON.parse(devMode)
      return parsed && typeof parsed === 'object' && parsed.enabled === true
    }
  } catch (error) {
    console.warn('Errore nel parsing dev mode:', error)
    // Pulisce il valore corrotto
    localStorage.removeItem(DEV_MODE_KEY)
    localStorage.removeItem('haccp-dev-mode')
    localStorage.removeItem('haccp-dev-mode-version')
  }
  
  return false
}

// Funzione per attivare/disattivare la modalità dev
export const toggleDevMode = (enabled = null, reason = '') => {
  const currentMode = isDevMode()
  const newMode = enabled !== null ? enabled : !currentMode
  
  const devModeData = {
    enabled: newMode,
    features: newMode ? ['bypass-onboarding', 'show-debug-info'] : [],
    bypassOnboarding: newMode,
    showDebugInfo: newMode,
    lastToggled: new Date().toISOString(),
    reason: reason || (newMode ? 'Attivato manualmente' : 'Disattivato manualmente')
  }
  
  try {
    localStorage.setItem(DEV_MODE_KEY, JSON.stringify(devModeData))
    
    // Se attivato, ricarica la pagina per applicare le modifiche
    if (newMode && !currentMode) {
      window.location.reload()
    }
    
    return newMode
  } catch (error) {
    console.error('Errore nel salvataggio dev mode:', error)
    return false
  }
}

// Funzione per ottenere le impostazioni dev mode
export const getDevModeSettings = () => {
  try {
    const devMode = localStorage.getItem(DEV_MODE_KEY)
    if (devMode && devMode !== 'undefined' && devMode !== 'null') {
      // localStorage.getItem restituisce sempre stringhe o null
      // Quindi proviamo sempre a parsare come JSON
      const parsed = JSON.parse(devMode)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    }
  } catch (error) {
    console.warn('Errore nel parsing dev mode settings:', error)
    // Pulisce il valore corrotto
    localStorage.removeItem(DEV_MODE_KEY)
  }
  
  return {
    enabled: false,
    features: [],
    bypassOnboarding: false,
    showDebugInfo: false,
    lastToggled: null,
    reason: null
  }
}

// Funzione per verificare se una feature dev è attiva
export const isDevFeatureEnabled = (feature) => {
  if (!isDevMode()) return false
  
  const settings = getDevModeSettings()
  return settings.features.includes(feature)
}

// Funzione per bypassare l'onboarding in modalità dev
export const shouldBypassOnboarding = () => {
  return isDevMode() && isDevFeatureEnabled('bypass-onboarding')
}

// Funzione per mostrare info debug in modalità dev
export const shouldShowDebugInfo = () => {
  return isDevMode() && isDevFeatureEnabled('show-debug-info')
}

// Funzione per ottenere informazioni di debug
export const getDebugInfo = () => {
  if (!shouldShowDebugInfo()) return null
  
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    localStorage: {
      keys: Object.keys(localStorage),
      size: new Blob(Object.values(localStorage)).size
    },
    sessionStorage: {
      keys: Object.keys(sessionStorage),
      size: new Blob(Object.values(sessionStorage)).size
    },
    url: window.location.href,
    devMode: getDevModeSettings()
  }
}

// Funzione per pulire i dati di sviluppo
export const clearDevData = () => {
  if (!isDevMode()) return false
  
  try {
    // Rimuovi solo i dati di sviluppo, mantieni i dati HACCP
    const keysToRemove = [
      'haccp-dev-mode',
      'haccp-onboarding',
      'haccp-presets'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    return true
  } catch (error) {
    console.error('Errore nella pulizia dati dev:', error)
    return false
  }
}

// Funzione per inizializzare la modalità dev
export const initializeDevMode = () => {
  // Se l'URL ha ?dev=1, attiva automaticamente la modalità dev
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('dev') === '1') {
    const currentSettings = getDevModeSettings()
    if (!currentSettings.enabled) {
      toggleDevMode(true, 'Attivato via URL parameter')
    }
  }
  
  return isDevMode()
}

export default {
  isDevMode,
  toggleDevMode,
  getDevModeSettings,
  isDevFeatureEnabled,
  shouldBypassOnboarding,
  shouldShowDebugInfo,
  getDebugInfo,
  clearDevData,
  initializeDevMode
}
