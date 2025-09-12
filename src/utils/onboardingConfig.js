/**
 * Configurazione del sistema di gestione dati dell'onboarding
 * Personalizza il comportamento del sistema secondo le esigenze specifiche
 */

// Configurazione generale
export const ONBOARDING_CONFIG = {
  // Versione del sistema
  version: '1.0.0',
  
  // Nome dell'applicazione
  appName: 'Business HACCP Manager',
  
  // Prefisso per le chiavi localStorage
  localStoragePrefix: 'haccp',
  
  // Limite massimo di log in memoria
  maxLogs: 1000,
  
  // Giorni di conservazione log
  logRetentionDays: 7,
  
  // Abilita logging dettagliato
  enableDetailedLogging: true,
  
  // Abilita validazione rigorosa
  enableStrictValidation: true,
  
  // Abilita risoluzione automatica conflitti
  enableAutoConflictResolution: true,
  
  // Abilita backup automatico
  enableAutoBackup: true,
  
  // Abilita pulizia automatica dati corrotti
  enableAutoCleanup: true
};

// Configurazione per la normalizzazione dei dati
export const NORMALIZATION_CONFIG = {
  // Caratteri massimi per i nomi
  maxNameLength: 100,
  
  // Caratteri minimi per i nomi
  minNameLength: 2,
  
  // Caratteri massimi per le descrizioni
  maxDescriptionLength: 500,
  
  // Caratteri massimi per gli indirizzi
  maxAddressLength: 200,
  
  // Formato email valido
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  
  // Formato telefono valido
  phonePattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/,
  
  // Formato data valido
  datePattern: /^\d{4}-\d{2}-\d{2}$/,
  
  // Formato ID valido
  idPattern: /^[a-zA-Z0-9_-]+$/,
  
  // Caratteri speciali non consentiti nei nomi
  forbiddenNameCharacters: /[<>:"/\\|?*]/,
  
  // Caratteri speciali non consentiti negli ID
  forbiddenIdCharacters: /[^a-zA-Z0-9_-]/
};

// Configurazione per la mappatura dei dati
export const MAPPING_CONFIG = {
  // Sezioni da mappare
  sections: [
    'departments',
    'staff',
    'refrigerators',
    'cleaning',
    'products',
    'maintenanceTasks',
    'businessInfo'
  ],
  
  // Chiavi localStorage per ogni sezione
  localStorageKeys: {
    departments: 'haccp-departments',
    staff: 'haccp-staff',
    refrigerators: 'haccp-refrigerators',
    cleaning: 'haccp-cleaning',
    products: 'haccp-products',
    maintenanceTasks: 'haccp-maintenance-tasks',
    businessInfo: 'haccp-business-info'
  },
  
  // Prefissi per gli ID generati
  idPrefixes: {
    departments: 'dept',
    staff: 'staff',
    refrigerators: 'point',
    cleaning: 'task',
    products: 'product',
    maintenanceTasks: 'maintenance'
  },
  
  // Campi obbligatori per ogni sezione
  requiredFields: {
    departments: ['name', 'enabled'],
    staff: ['name', 'surname', 'role'],
    refrigerators: ['name', 'targetTemp'],
    cleaning: ['name', 'frequency'],
    products: ['name', 'type', 'expiryDate', 'position'],
    maintenanceTasks: ['task_type', 'frequency', 'conservation_point_id']
  }
};

// Configurazione per la risoluzione dei conflitti
export const CONFLICT_RESOLUTION_CONFIG = {
  // Strategie predefinite per ogni tipo di conflitto
  defaultStrategies: {
    DUPLICATE_ID: 'replace_with_new',
    DUPLICATE_NAME: 'rename',
    MISSING_REFERENCE: 'skip',
    DATA_INCONSISTENCY: 'merge',
    VALIDATION_ERROR: 'skip'
  },
  
  // Strategie specifiche per sezione
  sectionStrategies: {
    departments: {
      DUPLICATE_NAME: 'rename',
      DUPLICATE_ID: 'replace_with_new'
    },
    staff: {
      DUPLICATE_NAME: 'rename',
      DUPLICATE_ID: 'replace_with_new'
    },
    refrigerators: {
      DUPLICATE_NAME: 'rename',
      DUPLICATE_ID: 'replace_with_new'
    },
    cleaning: {
      DUPLICATE_NAME: 'rename',
      DUPLICATE_ID: 'replace_with_new'
    },
    products: {
      DUPLICATE_NAME: 'rename',
      DUPLICATE_ID: 'replace_with_new'
    },
    maintenanceTasks: {
      DUPLICATE_ID: 'replace_with_new',
      MISSING_REFERENCE: 'skip'
    }
  },
  
  // Limiti per la risoluzione automatica
  limits: {
    maxConflictsToAutoResolve: 10,
    maxItemsToRename: 5,
    maxItemsToMerge: 3
  }
};

// Configurazione per la validazione
export const VALIDATION_CONFIG = {
  // Regole di validazione per ogni campo
  fieldRules: {
    business: {
      name: { required: true, minLength: 2, maxLength: 100 },
      address: { required: true, minLength: 10, maxLength: 200 },
      phone: { required: false, pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/ },
      email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    },
    departments: {
      list: { required: true, minItems: 1, maxItems: 20 },
      enabledCount: { required: true, min: 1 }
    },
    staff: {
      staffMembers: { required: true, minItems: 1, maxItems: 50 }
    },
    conservation: {
      points: { required: true, minItems: 1, maxItems: 20 },
      count: { required: true, min: 1 }
    },
    tasks: {
      list: { required: true, minItems: 0, maxItems: 100 },
      count: { required: true, min: 0 }
    },
    products: {
      productsList: { required: true, minItems: 1, maxItems: 1000 },
      count: { required: true, min: 1 }
    }
  },
  
  // Validazioni aggiuntive
  additionalValidations: {
    // Controlla che i nomi siano unici
    checkUniqueNames: true,
    
    // Controlla che i riferimenti siano validi
    checkValidReferences: true,
    
    // Controlla che i dati siano coerenti
    checkDataConsistency: true,
    
    // Controlla che i formati siano corretti
    checkDataFormats: true
  },
  
  // Messaggi di errore personalizzati
  errorMessages: {
    required: 'Campo obbligatorio',
    minLength: 'Minimo {min} caratteri',
    maxLength: 'Massimo {max} caratteri',
    min: 'Valore minimo: {min}',
    max: 'Valore massimo: {max}',
    pattern: 'Formato non valido',
    minItems: 'Minimo {min} elementi',
    maxItems: 'Massimo {max} elementi',
    unique: 'Valore deve essere unico',
    validReference: 'Riferimento non valido'
  }
};

// Configurazione per il logging
export const LOGGING_CONFIG = {
  // Livelli di log abilitati
  enabledLevels: ['debug', 'info', 'warn', 'error'],
  
  // Operazioni da tracciare
  trackedOperations: [
    'onboarding_start',
    'onboarding_step',
    'onboarding_complete',
    'data_normalization',
    'data_mapping',
    'conflict_detection',
    'conflict_resolution',
    'data_migration',
    'data_validation',
    'backup_create',
    'backup_restore',
    'data_cleanup'
  ],
  
  // Formato dei log
  logFormat: 'json',
  
  // Abilita log nella console
  enableConsoleLogging: true,
  
  // Abilita log nel localStorage
  enableStorageLogging: true,
  
  // Abilita log di performance
  enablePerformanceLogging: true
};

// Configurazione per il backup
export const BACKUP_CONFIG = {
  // Abilita backup automatico
  enableAutoBackup: true,
  
  // Frequenza backup (in minuti)
  backupInterval: 30,
  
  // Numero massimo di backup da mantenere
  maxBackups: 5,
  
  // Chiave localStorage per i backup
  backupKey: 'haccp-backup',
  
  // Chiave localStorage per i metadati backup
  metadataKey: 'haccp-backup-metadata'
};

// Configurazione per la pulizia dei dati
export const CLEANUP_CONFIG = {
  // Abilita pulizia automatica
  enableAutoCleanup: true,
  
  // Frequenza pulizia (in ore)
  cleanupInterval: 24,
  
  // Chiavi da pulire
  keysToClean: [
    'haccp-onboarding',
    'haccp-onboarding-new',
    'haccp-temp-data'
  ],
  
  // Pattern per identificare dati corrotti
  corruptedDataPatterns: [
    /^[^a-zA-Z0-9_-]+$/, // Solo caratteri speciali
    /^null$/, // Stringa "null"
    /^undefined$/, // Stringa "undefined"
    /^\[object Object\]$/ // Stringa "[object Object]"
  ]
};

// Configurazione per le notifiche
export const NOTIFICATION_CONFIG = {
  // Abilita notifiche
  enableNotifications: true,
  
  // Tipi di notifiche
  notificationTypes: {
    success: { icon: '✅', color: 'green' },
    warning: { icon: '⚠️', color: 'yellow' },
    error: { icon: '❌', color: 'red' },
    info: { icon: 'ℹ️', color: 'blue' }
  },
  
  // Durata notifiche (in secondi)
  notificationDuration: 5,
  
  // Posizione notifiche
  notificationPosition: 'top-right'
};

// Configurazione per l'esportazione
export const EXPORT_CONFIG = {
  // Formati supportati
  supportedFormats: ['json', 'csv', 'xlsx'],
  
  // Formato predefinito
  defaultFormat: 'json',
  
  // Nome file predefinito
  defaultFileName: 'onboarding-data',
  
  // Includi metadati nell'esportazione
  includeMetadata: true,
  
  // Includi log nell'esportazione
  includeLogs: false,
  
  // Comprimi l'esportazione
  compressExport: false
};

// Configurazione per l'importazione
export const IMPORT_CONFIG = {
  // Formati supportati
  supportedFormats: ['json', 'csv', 'xlsx'],
  
  // Validazione automatica all'importazione
  validateOnImport: true,
  
  // Backup automatico prima dell'importazione
  backupBeforeImport: true,
  
  // Sostituisci dati esistenti
  replaceExistingData: false,
  
  // Merge con dati esistenti
  mergeWithExistingData: true
};

// Configurazione per la sicurezza
export const SECURITY_CONFIG = {
  // Abilita validazione input
  enableInputValidation: true,
  
  // Abilita sanitizzazione dati
  enableDataSanitization: true,
  
  // Abilita controllo integrità
  enableIntegrityCheck: true,
  
  // Chiave per la crittografia (se necessaria)
  encryptionKey: null,
  
  // Abilita logging sicurezza
  enableSecurityLogging: true
};

// Configurazione per le performance
export const PERFORMANCE_CONFIG = {
  // Abilita ottimizzazioni
  enableOptimizations: true,
  
  // Limite elementi per operazione batch
  batchSize: 100,
  
  // Timeout per operazioni (in ms)
  operationTimeout: 30000,
  
  // Abilita caching
  enableCaching: true,
  
  // Durata cache (in minuti)
  cacheDuration: 60,
  
  // Abilita lazy loading
  enableLazyLoading: true
};

// Configurazione completa
export const COMPLETE_CONFIG = {
  general: ONBOARDING_CONFIG,
  normalization: NORMALIZATION_CONFIG,
  mapping: MAPPING_CONFIG,
  conflictResolution: CONFLICT_RESOLUTION_CONFIG,
  validation: VALIDATION_CONFIG,
  logging: LOGGING_CONFIG,
  backup: BACKUP_CONFIG,
  cleanup: CLEANUP_CONFIG,
  notifications: NOTIFICATION_CONFIG,
  export: EXPORT_CONFIG,
  import: IMPORT_CONFIG,
  security: SECURITY_CONFIG,
  performance: PERFORMANCE_CONFIG
};

// Funzione per ottenere la configurazione
export const getConfig = (section = null) => {
  if (section) {
    return COMPLETE_CONFIG[section] || null;
  }
  return COMPLETE_CONFIG;
};

// Funzione per aggiornare la configurazione
export const updateConfig = (section, newConfig) => {
  if (COMPLETE_CONFIG[section]) {
    COMPLETE_CONFIG[section] = { ...COMPLETE_CONFIG[section], ...newConfig };
    return true;
  }
  return false;
};

// Funzione per resettare la configurazione
export const resetConfig = () => {
  // Ricarica la configurazione predefinita
  Object.keys(COMPLETE_CONFIG).forEach(section => {
    // Implementa il reset per ogni sezione
    console.log(`Reset configurazione sezione: ${section}`);
  });
};

// Funzione per validare la configurazione
export const validateConfig = () => {
  const errors = [];
  
  // Valida configurazione generale
  if (!ONBOARDING_CONFIG.version) {
    errors.push('Versione non specificata');
  }
  
  if (!ONBOARDING_CONFIG.appName) {
    errors.push('Nome applicazione non specificato');
  }
  
  // Valida configurazione mappatura
  if (!MAPPING_CONFIG.sections || MAPPING_CONFIG.sections.length === 0) {
    errors.push('Nessuna sezione configurata per la mappatura');
  }
  
  // Valida configurazione validazione
  if (!VALIDATION_CONFIG.fieldRules) {
    errors.push('Regole di validazione non configurate');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Esporta la configurazione predefinita
export default COMPLETE_CONFIG;
