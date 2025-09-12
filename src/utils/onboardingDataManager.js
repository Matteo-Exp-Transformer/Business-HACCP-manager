/**
 * Gestore centralizzato per i dati dell'onboarding
 * Coordina normalizzazione, mappatura, risoluzione conflitti e logging
 */

import { 
  normalizeOnboardingData, 
  validateNormalizedData, 
  saveNormalizedData, 
  loadNormalizedData,
  cleanCorruptedData 
} from './dataNormalizer';

import { 
  mapNormalizedDataToApp, 
  saveMappedData, 
  createMappingReport,
  validateMappedData,
  createBackup,
  restoreFromBackup 
} from './dataMapper';

import { 
  detectConflicts, 
  resolveConflicts, 
  createConflictReport,
  validateConflictResolution 
} from './conflictResolver';

import { 
  dataLogger,
  logOnboardingStart,
  logOnboardingStep,
  logOnboardingComplete,
  logDataNormalization,
  logDataMapping,
  logConflictDetection,
  logConflictResolution,
  logDataMigration,
  logDataValidation,
  logBackupCreate
} from './dataLogger';

// Classe principale per la gestione dei dati dell'onboarding
export class OnboardingDataManager {
  constructor() {
    this.currentData = null;
    this.normalizedData = null;
    this.mappedData = null;
    this.conflicts = [];
    this.resolutionLog = [];
    this.isInitialized = false;
    
    // Inizializza il logger
    dataLogger.loadLogsFromStorage();
  }

  // Inizializza il gestore
  initialize() {
    if (this.isInitialized) return;
    
    // Pulisce i dati corrotti
    cleanCorruptedData();
    
    // Carica i dati normalizzati esistenti se disponibili
    this.normalizedData = loadNormalizedData();
    
    this.isInitialized = true;
    dataLogger.log('info', 'onboarding_manager_init', 'OnboardingDataManager initialized');
  }

  // Avvia il processo di onboarding
  startOnboarding(initialData = {}) {
    this.initialize();
    this.currentData = initialData;
    
    logOnboardingStart(initialData);
    
    return {
      success: true,
      message: 'Onboarding started',
      data: this.currentData
    };
  }

  // Aggiorna i dati di un step dell'onboarding
  updateStepData(stepNumber, stepData) {
    if (!this.currentData) {
      this.currentData = {};
    }
    
    // Aggiorna i dati per lo step specifico
    this.currentData[`step_${stepNumber}`] = stepData;
    
    // Aggiorna anche i dati principali se necessario
    Object.keys(stepData).forEach(key => {
      if (stepData[key] !== undefined) {
        this.currentData[key] = stepData[key];
      }
    });
    
    logOnboardingStep(stepNumber, stepData);
    
    return {
      success: true,
      message: `Step ${stepNumber} data updated`,
      data: this.currentData
    };
  }

  // Completa l'onboarding e processa tutti i dati
  completeOnboarding() {
    if (!this.currentData) {
      throw new Error('No onboarding data to complete');
    }
    
    try {
      // 1. Normalizza i dati
      this.normalizedData = normalizeOnboardingData(this.currentData);
      const normalizationValidation = validateNormalizedData(this.normalizedData);
      
      if (!normalizationValidation.isValid) {
        logDataNormalization(this.normalizedData, normalizationValidation.errors);
        throw new Error(`Data normalization failed: ${JSON.stringify(normalizationValidation.errors)}`);
      }
      
      logDataNormalization(this.normalizedData);
      
      // 2. Crea un backup dei dati esistenti
      const backup = createBackup();
      logBackupCreate(backup);
      
      // 3. Mappa i dati normalizzati alle sezioni dell'app
      const mappingResult = mapNormalizedDataToApp(this.normalizedData);
      this.mappedData = mappingResult.data;
      
      if (mappingResult.errors) {
        logDataMapping(this.mappedData, mappingResult.errors);
        throw new Error(`Data mapping failed: ${JSON.stringify(mappingResult.errors)}`);
      }
      
      logDataMapping(this.mappedData);
      
      // 4. Rileva e risolve i conflitti
      this.detectAndResolveConflicts();
      
      // 5. Valida i dati mappati
      const mappingValidation = validateMappedData(this.mappedData);
      if (!mappingValidation.isValid) {
        logDataValidation(mappingValidation);
        throw new Error(`Data validation failed: ${JSON.stringify(mappingValidation.errors)}`);
      }
      
      logDataValidation(mappingValidation);
      
      // 6. Salva i dati normalizzati
      const saveSuccess = saveNormalizedData(this.normalizedData);
      if (!saveSuccess) {
        throw new Error('Failed to save normalized data');
      }
      
      // 7. Salva i dati mappati
      const mappingSaveSuccess = saveMappedData(this.mappedData);
      if (!mappingSaveSuccess) {
        throw new Error('Failed to save mapped data');
      }
      
      // 8. Crea i report finali
      const mappingReport = createMappingReport(this.normalizedData, this.mappedData);
      const conflictReport = createConflictReport(this.conflicts, this.resolutionLog);
      
      logOnboardingComplete({
        normalizedData: this.normalizedData,
        mappedData: this.mappedData,
        mappingReport,
        conflictReport
      });
      
      return {
        success: true,
        message: 'Onboarding completed successfully',
        data: {
          normalized: this.normalizedData,
          mapped: this.mappedData,
          mappingReport,
          conflictReport
        }
      };
      
    } catch (error) {
      dataLogger.log('error', 'onboarding_complete_error', 'Onboarding completion failed', {
        error: error.message,
        currentData: this.currentData,
        normalizedData: this.normalizedData,
        mappedData: this.mappedData
      });
      
      // Ripristina il backup in caso di errore
      restoreFromBackup();
      
      throw error;
    }
  }

  // Rileva e risolve i conflitti
  detectAndResolveConflicts() {
    if (!this.mappedData) return;
    
    // Carica i dati esistenti dal localStorage
    const existingData = this.loadExistingData();
    
    // Rileva i conflitti per ogni sezione
    Object.keys(this.mappedData).forEach(section => {
      const existingSectionData = existingData[section] || [];
      const newSectionData = this.mappedData[section] || [];
      
      const sectionConflicts = detectConflicts(existingSectionData, newSectionData, section);
      this.conflicts.push(...sectionConflicts);
    });
    
    if (this.conflicts.length > 0) {
      logConflictDetection(this.conflicts);
      
      // Risolve i conflitti
      const resolutionResult = resolveConflicts(this.conflicts);
      this.resolutionLog = resolutionResult.resolutionLog;
      
      // Applica la risoluzione ai dati
      this.mappedData = this.applyConflictResolution(existingData, this.mappedData, this.conflicts, this.resolutionLog);
      
      logConflictResolution(resolutionResult);
    }
  }

  // Carica i dati esistenti dal localStorage
  loadExistingData() {
    const existingData = {};
    
    // Carica i dati per ogni sezione
    const sections = ['departments', 'staff', 'refrigerators', 'cleaning', 'products', 'maintenanceTasks', 'businessInfo'];
    
    sections.forEach(section => {
      try {
        const data = localStorage.getItem(`haccp-${section}`);
        if (data) {
          existingData[section] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Error loading existing data for ${section}:`, error);
        existingData[section] = [];
      }
    });
    
    return existingData;
  }

  // Applica la risoluzione dei conflitti
  applyConflictResolution(existingData, newData, conflicts, resolutionLog) {
    const finalData = { ...existingData };
    
    Object.keys(resolutionLog).forEach(section => {
      const resolution = resolutionLog[section];
      const resolvedItems = resolution.resolvedData || [];
      
      if (resolution.strategy === 'replace_with_new') {
        // Rimuovi gli elementi esistenti con gli stessi ID
        const idsToReplace = resolvedItems.map(item => item.id);
        finalData[section] = (finalData[section] || []).filter(item => !idsToReplace.includes(item.id));
      }
      
      // Aggiungi gli elementi risolti
      finalData[section] = [...(finalData[section] || []), ...resolvedItems];
    });
    
    return finalData;
  }

  // Ottiene lo stato attuale
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasCurrentData: !!this.currentData,
      hasNormalizedData: !!this.normalizedData,
      hasMappedData: !!this.mappedData,
      conflictsCount: this.conflicts.length,
      resolutionLogCount: this.resolutionLog.length
    };
  }

  // Ottiene i dati normalizzati
  getNormalizedData() {
    return this.normalizedData;
  }

  // Ottiene i dati mappati
  getMappedData() {
    return this.mappedData;
  }

  // Ottiene i conflitti rilevati
  getConflicts() {
    return this.conflicts;
  }

  // Ottiene il log di risoluzione
  getResolutionLog() {
    return this.resolutionLog;
  }

  // Crea un report completo
  createFullReport() {
    const status = this.getStatus();
    const mappingReport = this.mappedData ? createMappingReport(this.normalizedData, this.mappedData) : null;
    const conflictReport = this.conflicts.length > 0 ? createConflictReport(this.conflicts, this.resolutionLog) : null;
    const logReport = dataLogger.createLogReport();
    const performanceReport = dataLogger.createPerformanceReport();
    
    return {
      timestamp: new Date().toISOString(),
      status,
      mappingReport,
      conflictReport,
      logReport,
      performanceReport
    };
  }

  // Pulisce i dati temporanei
  cleanup() {
    this.currentData = null;
    this.normalizedData = null;
    this.mappedData = null;
    this.conflicts = [];
    this.resolutionLog = [];
    
    dataLogger.log('info', 'onboarding_manager_cleanup', 'OnboardingDataManager cleaned up');
  }

  // Esporta tutti i dati
  exportData(format = 'json') {
    const data = {
      currentData: this.currentData,
      normalizedData: this.normalizedData,
      mappedData: this.mappedData,
      conflicts: this.conflicts,
      resolutionLog: this.resolutionLog,
      report: this.createFullReport()
    };
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    return data;
  }
}

// Istanza globale del gestore
export const onboardingDataManager = new OnboardingDataManager();

// Funzioni di convenienza
export const startOnboarding = (data) => onboardingDataManager.startOnboarding(data);
export const updateStepData = (step, data) => onboardingDataManager.updateStepData(step, data);
export const completeOnboarding = () => onboardingDataManager.completeOnboarding();
export const getOnboardingStatus = () => onboardingDataManager.getStatus();
export const getOnboardingData = () => onboardingDataManager.getNormalizedData();
export const getMappedData = () => onboardingDataManager.getMappedData();
export const getConflicts = () => onboardingDataManager.getConflicts();
export const createOnboardingReport = () => onboardingDataManager.createFullReport();
export const exportOnboardingData = (format) => onboardingDataManager.exportData(format);
export const cleanupOnboarding = () => onboardingDataManager.cleanup();
