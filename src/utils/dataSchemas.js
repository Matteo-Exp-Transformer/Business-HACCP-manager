/**
 * Data Schemas - Schemi dati per nuove funzionalità HACCP
 * 
 * Questo file definisce la struttura dei dati per:
 * - haccp-roles: Ruoli e gerarchie staff
 * - haccp-suppliers: Fornitori e categorie merceologiche
 * - haccp-onboarding: Progresso onboarding utente
 * - haccp-presets: Preset attività (pizzeria, ristorante, etc.)
 * - haccp-dev-mode: Flag modalità sviluppo
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Struttura dati
 */

// Schema per ruoli staff (gerarchia)
export const ROLES_SCHEMA = {
  id: 'string',
  name: 'string',
  level: 'number', // 1=Amministratore, 2=Responsabile, 3=Dipendente, 4=Collaboratore
  permissions: ['string'], // Array di permessi
  description: 'string',
  createdAt: 'string', // ISO date
  updatedAt: 'string' // ISO date
}

// Schema per fornitori
export const SUPPLIERS_SCHEMA = {
  id: 'string',
  name: 'string',
  category: 'string', // latticini, salumi, verdure, farine, surgelati, altro
  vat: 'string?', // Partita IVA (opzionale)
  phone: 'string?', // Telefono (opzionale)
  email: 'string?', // Email (opzionale)
  address: 'string?', // Indirizzo (opzionale)
  notes: 'string?', // Note aggiuntive (opzionale)
  reliability: 'number', // Valutazione affidabilità 1-5
  lastOrder: 'string?', // Data ultimo ordine
  createdAt: 'string', // ISO date
  updatedAt: 'string' // ISO date
}

// Schema per onboarding utente
export const ONBOARDING_SCHEMA = {
  currentStep: 'string', // preset, departments, refrigerators, staff, suppliers, manual
  completedSteps: ['string'], // Array di step completati
  progress: 'number', // Percentuale completamento 0-100
  startedAt: 'string', // ISO date
  completedAt: 'string?', // ISO date (null se non completato)
  lastActivity: 'string' // ISO date ultima attività
}

// Schema per preset attività
export const PRESETS_SCHEMA = {
  id: 'string', // pizzeria, ristorante, bar, pasticceria, etc.
  name: 'string', // Nome visualizzato
  description: 'string', // Descrizione attività
  category: 'string', // ristorazione, retail, produzione
  departments: ['string'], // Dipartimenti predefiniti
  refrigerators: ['string'], // Punti di refrigerazione predefiniti
  staffPositions: ['string'], // Posizioni staff predefinite
  createdAt: 'string', // ISO date
  isActive: 'boolean' // Se è il preset attualmente attivo
}

// Schema per modalità sviluppo
export const DEV_MODE_SCHEMA = {
  enabled: 'boolean', // Se la modalità dev è attiva
  features: ['string'], // Array di feature dev abilitate
  bypassOnboarding: 'boolean', // Se bypassare onboarding
  showDebugInfo: 'boolean', // Se mostrare info debug
  lastToggled: 'string', // ISO date ultimo toggle
  reason: 'string?' // Motivo attivazione (opzionale)
}

// Funzione di inizializzazione sicura per schemi
export const initializeDataSchemas = () => {
  const schemas = {
    'haccp-roles': [],
    'haccp-suppliers': [],
    'haccp-onboarding': {
      currentStep: 'preset',
      completedSteps: [],
      progress: 0,
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    },
    'haccp-presets': [],
    'haccp-dev-mode': {
      enabled: false,
      features: [],
      bypassOnboarding: false,
      showDebugInfo: false,
      lastToggled: new Date().toISOString()
    }
  }

  return schemas
}

// Funzione per inizializzare la modalità dev se richiesta
export const initializeDevModeIfRequested = () => {
  try {
    // Controlla se l'URL ha ?dev=1
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('dev') === '1') {
      const devModeData = {
        enabled: true,
        features: ['bypass-onboarding', 'show-debug-info'],
        bypassOnboarding: true,
        showDebugInfo: true,
        lastToggled: new Date().toISOString(),
        reason: 'Attivato via URL parameter'
      }
      
      localStorage.setItem('haccp-dev-mode', JSON.stringify(devModeData))
      console.log('🚀 Dev mode attivato via URL parameter')
      return true
    }
  } catch (error) {
    console.warn('Errore nell\'inizializzazione dev mode:', error)
  }
  
  return false
}

// Funzione per validare schema dati
export const validateSchema = (data, schema) => {
  // Validazione base - implementare logica completa in futuro
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Dati non validi' }
  }
  
  return { valid: true, error: null }
}

// Funzione per creare ID univoci
export const generateId = (prefix = 'item') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Funzione per timestamp ISO
export const getTimestamp = () => new Date().toISOString()

// Esporta schemi per uso esterno
export default {
  ROLES_SCHEMA,
  SUPPLIERS_SCHEMA,
  ONBOARDING_SCHEMA,
  PRESETS_SCHEMA,
  DEV_MODE_SCHEMA,
  initializeDataSchemas,
  validateSchema,
  generateId,
  getTimestamp
}
