/**
 * Maintenance Constants - Costanti per attività di manutenzione HACCP
 * 
 * Questo file definisce:
 * 1. Tipi di attività manutentive obbligatorie
 * 2. Frequenze disponibili per ogni tipo
 * 3. Ruoli e categorie per assegnazione
 * 4. Validazioni e regole business
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Manutenzione impianti
 */

// Tipi di attività manutentive obbligatorie
export const MAINTENANCE_TASK_TYPES = {
  TEMPERATURE_MONITORING: 'temperature_monitoring',
  SANITIZATION: 'sanitization', 
  DEFROSTING: 'defrosting'
}

// Nomi display per le attività
export const MAINTENANCE_TASK_NAMES = {
  [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: 'Rilevamento Temperatura',
  [MAINTENANCE_TASK_TYPES.SANITIZATION]: 'Sanificazione',
  [MAINTENANCE_TASK_TYPES.DEFROSTING]: 'Sbrinamento'
}

// Frequenze disponibili per ogni tipo di attività
export const MAINTENANCE_FREQUENCIES = {
  [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: [
    { value: 'daily', label: 'Giornalmente' },
    { value: 'weekly', label: 'Settimanale' },
    { value: 'monthly', label: 'Mensile' }
  ],
  [MAINTENANCE_TASK_TYPES.SANITIZATION]: [
    { value: 'daily', label: 'Giornalmente' },
    { value: 'weekly', label: 'Settimanale' }
  ],
  [MAINTENANCE_TASK_TYPES.DEFROSTING]: [
    { value: 'semiannual', label: 'Semestrale (ogni 6 mesi)' },
    { value: 'annual', label: 'Annuale' }
  ]
}

// Ruoli disponibili per assegnazione manutenzione
export const MAINTENANCE_ROLES = [
  { value: 'amministratore', label: 'Amministratore' },
  { value: 'responsabile', label: 'Responsabile' },
  { value: 'dipendente', label: 'Dipendente' },
  { value: 'collaboratore', label: 'Collaboratore Occasionale' }
]

// Categorie staff per assegnazione manutenzione
export const MAINTENANCE_CATEGORIES = [
  { value: 'amministratore', label: 'Amministratore' },
  { value: 'cuochi', label: 'Cuochi' },
  { value: 'banconisti', label: 'Banconisti' },
  { value: 'camerieri', label: 'Camerieri' },
  { value: 'social_media_manager', label: 'Social & Media Manager' },
  { value: 'altro', label: 'Altro' }
]

// Schema per record maintenance_tasks
export const MAINTENANCE_TASK_SCHEMA = {
  id: 'string',
  company_id: 'string',
  conservation_point_id: 'string',
  task_type: 'string', // temperature_monitoring, sanitization, defrosting
  frequency: 'string', // daily, weekly, monthly, semiannual, annual
  assigned_role: 'string', // ruolo assegnato
  assigned_category: 'string', // categoria assegnata
  assigned_staff_ids: ['string'], // array di ID dipendenti specifici
  is_active: 'boolean',
  created_at: 'string', // ISO date
  updated_at: 'string' // ISO date
}

// Validazioni per ogni tipo di attività
export const MAINTENANCE_VALIDATIONS = {
  [MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING]: {
    requiredFields: ['frequency'],
    optionalFields: ['assigned_role', 'assigned_category', 'assigned_staff_ids'],
    frequencyOptions: MAINTENANCE_FREQUENCIES[MAINTENANCE_TASK_TYPES.TEMPERATURE_MONITORING].map(f => f.value)
  },
  [MAINTENANCE_TASK_TYPES.SANITIZATION]: {
    requiredFields: ['frequency'],
    optionalFields: ['assigned_role', 'assigned_category', 'assigned_staff_ids'],
    frequencyOptions: MAINTENANCE_FREQUENCIES[MAINTENANCE_TASK_TYPES.SANITIZATION].map(f => f.value)
  },
  [MAINTENANCE_TASK_TYPES.DEFROSTING]: {
    requiredFields: ['frequency'],
    optionalFields: ['assigned_role', 'assigned_category', 'assigned_staff_ids'],
    frequencyOptions: MAINTENANCE_FREQUENCIES[MAINTENANCE_TASK_TYPES.DEFROSTING].map(f => f.value)
  }
}

// Funzione per validare una configurazione di manutenzione
export const validateMaintenanceConfig = (taskType, config) => {
  const validation = MAINTENANCE_VALIDATIONS[taskType]
  const errors = []
  
  // Controlla campi obbligatori (solo frequenza)
  validation.requiredFields.forEach(field => {
    if (!config[field] || (Array.isArray(config[field]) && config[field].length === 0)) {
      errors.push(`${field} è obbligatorio per ${MAINTENANCE_TASK_NAMES[taskType]}`)
    }
  })
  
  // Controlla frequenza valida
  if (config.frequency && !validation.frequencyOptions.includes(config.frequency)) {
    errors.push(`Frequenza non valida per ${MAINTENANCE_TASK_NAMES[taskType]}`)
  }
  
  // Nuova logica: almeno uno tra Ruolo o Dipendenti Specifici deve essere selezionato
  const hasRole = !!config.assigned_role
  const hasStaff = config.assigned_staff_ids && config.assigned_staff_ids.length > 0
  
  if (!hasRole && !hasStaff) {
    errors.push(`Devi selezionare almeno Ruolo o Dipendenti Specifici per ${MAINTENANCE_TASK_NAMES[taskType]}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Funzione per ottenere le frequenze disponibili per un tipo di attività
export const getFrequenciesForTaskType = (taskType) => {
  return MAINTENANCE_FREQUENCIES[taskType] || []
}

// Funzione per ottenere il nome display di un tipo di attività
export const getTaskTypeDisplayName = (taskType) => {
  return MAINTENANCE_TASK_NAMES[taskType] || taskType
}

// Funzione per ottenere il nome display di una frequenza
export const getFrequencyDisplayName = (taskType, frequency) => {
  const frequencies = getFrequenciesForTaskType(taskType)
  const freq = frequencies.find(f => f.value === frequency)
  return freq ? freq.label : frequency
}

export default {
  MAINTENANCE_TASK_TYPES,
  MAINTENANCE_TASK_NAMES,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_ROLES,
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_TASK_SCHEMA,
  MAINTENANCE_VALIDATIONS,
  validateMaintenanceConfig,
  getFrequenciesForTaskType,
  getTaskTypeDisplayName,
  getFrequencyDisplayName
}
