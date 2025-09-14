/**
 * Modelli di dati tipizzati per l'applicazione HACCP
 * Definisce la struttura standardizzata per tutti i dati dell'applicazione
 */

// Tipi per frequenze di manutenzione
export const FREQUENCY_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly', 
  MONTHLY: 'monthly',
  SEMIANNUAL: 'semiannual',
  ANNUAL: 'annual'
}

// Tipi per ruoli assegnati
export const ASSIGNED_ROLES = {
  ADMIN: 'amministratore',
  MANAGER: 'responsabile', 
  EMPLOYEE: 'dipendente',
  COLLABORATOR: 'collaboratore',
  OTHER: 'altro'
}

// Tipi per modalità temperatura
export const TEMP_MODES = {
  FIXED: 'fixed',
  RANGE: 'range',
  AMBIENT: 'ambient'
}

// Configurazione task di manutenzione
export const MaintenanceTaskConfig = {
  frequency: 'daily', // FREQUENCY_TYPES
  assigned_role: 'dipendente', // ASSIGNED_ROLES
  assigned_category: '', // es. 'cuochi', 'banconisti'
  assigned_staff_ids: [] // array di ID staff
}

// Dati di manutenzione per un punto di conservazione
export const MaintenanceData = {
  temperature_monitoring: null, // MaintenanceTaskConfig | null
  sanitization: null, // MaintenanceTaskConfig | null  
  defrosting: null // MaintenanceTaskConfig | null
}

// Modello normalizzato per Punto di Conservazione
export const ConservationPoint = {
  id: '', // string - ID univoco
  name: '', // string - Nome del punto
  departmentId: '', // string | undefined - ID reparto
  departmentName: '', // string | undefined - Nome reparto (denormalizzato per UI)
  setTempMode: 'ambient', // TEMP_MODES
  setTempC: undefined, // number | undefined - Solo per 'fixed'
  setTempRangeC: undefined, // {min: number, max: number} | undefined - Solo per 'range'
  storageCategoryIds: [], // string[] - Max 5 categorie
  isBlastChiller: false, // boolean - Flag abbattitore
  maintenance: {}, // MaintenanceData
  createdAt: '', // string - ISO timestamp
  updatedAt: undefined // string | undefined - ISO timestamp
}

// Modello per Log Temperature
export const TemperatureLog = {
  id: '', // string - ID univoco
  conservationPointId: '', // string - ID punto conservazione
  conservationPointName: '', // string - Nome per ricerca veloce
  temperatureC: 0, // number - Temperatura in °C
  timestamp: '', // string - ISO timestamp
  userId: undefined, // string | undefined - ID utente
  userName: undefined, // string | undefined - Nome utente
  userDepartment: undefined, // string | undefined - Reparto utente
  notes: undefined // string | undefined - Note aggiuntive
}

// Modello per Prodotto
export const Product = {
  id: '', // string - ID univoco
  name: '', // string - Nome prodotto
  categoryId: '', // string - ID categoria prodotto
  departmentName: '', // string - Nome reparto
  conservationPointName: '', // string - Nome punto conservazione
  expiryDate: '', // string - ISO date
  allergens: [], // string[] - Array allergeni
  notes: undefined, // string | undefined - Note
  lotNumber: undefined, // string | undefined - Numero lotto
  batchDeliveryDate: undefined, // string | undefined - ISO date
  supplierName: undefined, // string | undefined - Nome fornitore
  orderId: undefined, // string | undefined - ID ordine
  addedAt: '' // string - ISO timestamp
}

// Modello per Ordine
export const Order = {
  id: '', // string - ID univoco
  supplierName: '', // string - Nome fornitore
  orderDate: '', // string - ISO date
  notes: undefined, // string | undefined - Note
  productIds: [], // string[] - Array ID prodotti
  createdAt: '' // string - ISO timestamp
}

// Modello per Fornitore
export const Supplier = {
  id: '', // string - ID univoco
  name: '', // string - Nome fornitore
  contactInfo: undefined, // string | undefined - Info contatto
  notes: undefined, // string | undefined - Note
  createdAt: '' // string - ISO timestamp
}

// Modello per Reparto
export const Department = {
  id: '', // string - ID univoco
  name: '', // string - Nome reparto
  enabled: true, // boolean - Se attivo
  createdAt: '' // string - ISO timestamp
}

// Modello per Categoria di Stoccaggio
export const StorageCategory = {
  id: '', // string - ID univoco
  name: '', // string - Nome categoria
  description: '', // string - Descrizione
  temperatureMin: 0, // number - Temperatura minima °C
  temperatureMax: 0, // number - Temperatura massima °C
  isAmbient: false, // boolean - Se è ambiente
  notes: undefined, // string | undefined - Note
  createdAt: '' // string - ISO timestamp
}

// Helper per creare oggetti con valori di default
export const createConservationPoint = (overrides = {}) => ({
  id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  departmentId: undefined,
  departmentName: undefined,
  setTempMode: TEMP_MODES.AMBIENT,
  setTempC: undefined,
  setTempRangeC: undefined,
  storageCategoryIds: [],
  isBlastChiller: false,
  maintenance: {},
  createdAt: new Date().toISOString(),
  updatedAt: undefined,
  ...overrides
})

export const createTemperatureLog = (overrides = {}) => ({
  id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  conservationPointId: '',
  conservationPointName: '',
  temperatureC: 0,
  timestamp: new Date().toISOString(),
  userId: undefined,
  userName: undefined,
  userDepartment: undefined,
  notes: undefined,
  ...overrides
})

export const createProduct = (overrides = {}) => ({
  id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  name: '',
  categoryId: '',
  departmentName: '',
  conservationPointName: '',
  expiryDate: '',
  allergens: [],
  notes: undefined,
  lotNumber: undefined,
  batchDeliveryDate: undefined,
  supplierName: undefined,
  orderId: undefined,
  addedAt: new Date().toISOString(),
  ...overrides
})
