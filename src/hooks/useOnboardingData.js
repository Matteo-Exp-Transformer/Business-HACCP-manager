/**
 * Hook personalizzato per gestire i dati dell'onboarding
 * Fornisce un'interfaccia semplice per interagire con il sistema di gestione dati
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  onboardingDataManager,
  getOnboardingStatus,
  getOnboardingData,
  getMappedData,
  getConflicts,
  createOnboardingReport
} from '../utils/onboardingDataManager';

export const useOnboardingData = () => {
  const [status, setStatus] = useState(null);
  const [normalizedData, setNormalizedData] = useState(null);
  const [mappedData, setMappedData] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carica i dati
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentStatus = getOnboardingStatus();
      const currentNormalizedData = getOnboardingData();
      const currentMappedData = getMappedData();
      const currentConflicts = getConflicts();

      setStatus(currentStatus);
      setNormalizedData(currentNormalizedData);
      setMappedData(currentMappedData);
      setConflicts(currentConflicts);
    } catch (err) {
      setError(err.message);
      console.error('Error loading onboarding data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Avvia l'onboarding
  const startOnboarding = useCallback(async (initialData = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = onboardingDataManager.startOnboarding(initialData);
      await loadData();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Aggiorna i dati di un step
  const updateStepData = useCallback(async (stepNumber, stepData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = onboardingDataManager.updateStepData(stepNumber, stepData);
      await loadData();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Completa l'onboarding
  const completeOnboarding = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await onboardingDataManager.completeOnboarding();
      await loadData();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadData]);

  // Crea un report
  const createReport = useCallback(() => {
    try {
      return createOnboardingReport();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  // Pulisce i dati
  const cleanup = useCallback(() => {
    try {
      onboardingDataManager.cleanup();
      setStatus(null);
      setNormalizedData(null);
      setMappedData(null);
      setConflicts([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // Carica i dati al mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Stato
    status,
    normalizedData,
    mappedData,
    conflicts,
    isLoading,
    error,
    
    // Azioni
    loadData,
    startOnboarding,
    updateStepData,
    completeOnboarding,
    createReport,
    cleanup,
    
    // Utilità
    hasData: !!normalizedData,
    hasConflicts: conflicts.length > 0,
    isReady: status?.isInitialized && !isLoading && !error
  };
};

// Hook per gestire i conflitti specificamente
export const useOnboardingConflicts = () => {
  const [conflicts, setConflicts] = useState([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionLog, setResolutionLog] = useState([]);

  const loadConflicts = useCallback(() => {
    try {
      const currentConflicts = getConflicts();
      setConflicts(currentConflicts);
    } catch (err) {
      console.error('Error loading conflicts:', err);
    }
  }, []);

  const resolveConflicts = useCallback(async (strategy = null) => {
    setIsResolving(true);
    
    try {
      // Implementa la logica di risoluzione dei conflitti
      // Questo è un placeholder - implementa la logica specifica
      const result = { success: true, resolvedCount: conflicts.length };
      
      setResolutionLog(prev => [...prev, {
        timestamp: new Date().toISOString(),
        strategy,
        resolvedCount: conflicts.length,
        result
      }]);
      
      return result;
    } catch (err) {
      console.error('Error resolving conflicts:', err);
      throw err;
    } finally {
      setIsResolving(false);
    }
  }, [conflicts]);

  useEffect(() => {
    loadConflicts();
  }, [loadConflicts]);

  return {
    conflicts,
    resolutionLog,
    isResolving,
    loadConflicts,
    resolveConflicts,
    hasConflicts: conflicts.length > 0
  };
};

// Hook per gestire la migrazione dei dati
export const useOnboardingMigration = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrationError, setMigrationError] = useState(null);

  const startMigration = useCallback(async () => {
    setIsMigrating(true);
    setMigrationError(null);
    setMigrationStatus('starting');
    
    try {
      // Implementa la logica di migrazione
      // Questo è un placeholder - implementa la logica specifica
      
      setMigrationStatus('migrating');
      
      // Simula il processo di migrazione
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMigrationStatus('completed');
      
      return { success: true };
    } catch (err) {
      setMigrationError(err.message);
      setMigrationStatus('failed');
      throw err;
    } finally {
      setIsMigrating(false);
    }
  }, []);

  const resetMigration = useCallback(() => {
    setMigrationStatus(null);
    setMigrationError(null);
  }, []);

  return {
    isMigrating,
    migrationStatus,
    migrationError,
    startMigration,
    resetMigration
  };
};
