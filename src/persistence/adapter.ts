/**
 * Persistence Adapter - Foundation Pack v1
 * 
 * Adapter per gestire persistenza e migrazioni automatiche
 * Supporta localStorage con migrazione automatica da chiavi legacy
 * 
 * @version 1.0
 * @critical Architettura - Persistenza dati
 */

import { DataStore, OnboardingData, Entities, Meta } from '../store/dataStore'
import { migrateData } from './migrations'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface PersistenceAdapter {
  loadState(): Promise<Partial<DataStore> | null>
  saveState(partial: Partial<DataStore>): Promise<void>
  migrateIfNeeded(): Promise<boolean>
  clearStorage(): Promise<void>
}

// ============================================================================
// CHIAVI LOCALSTORAGE LEGACY
// ============================================================================

const LEGACY_KEYS = {
  ONBOARDING: 'haccp-onboarding',
  ONBOARDING_NEW: 'haccp-onboarding-new',
  REFRIGERATORS: 'haccp-refrigerators',
  TEMPERATURES: 'haccp-temperatures',
  CLEANING: 'haccp-cleaning',
  STAFF: 'haccp-staff',
  INVENTORY: 'haccp-products',
  DEPARTMENTS: 'haccp-departments',
  SUPPLIERS: 'haccp-suppliers',
  USERS: 'haccp-users',
  LAST_SYNC: 'haccp-last-sync',
  COMPANY_ID: 'haccp-company-id',
  LAST_CHECK: 'haccp-last-check'
} as const

const CURRENT_KEY = 'haccp-data-store'

// ============================================================================
// ADAPTER IMPLEMENTATION
// ============================================================================

export class LocalStoragePersistenceAdapter implements PersistenceAdapter {
  private isClient = typeof window !== 'undefined'

  async loadState(): Promise<Partial<DataStore> | null> {
    if (!this.isClient) return null

    try {
      // Prova prima a caricare il nuovo formato
      const newFormat = localStorage.getItem(CURRENT_KEY)
      if (newFormat) {
        const parsed = JSON.parse(newFormat)
        return parsed.state || parsed
      }

      // Se non c'è il nuovo formato, carica e migra i dati legacy
      return await this.loadLegacyData()
    } catch (error) {
      console.error('Errore nel caricamento dello stato:', error)
      return null
    }
  }

  async saveState(partial: Partial<DataStore>): Promise<void> {
    if (!this.isClient) return

    try {
      const currentState = await this.loadState() || {}
      const newState = { ...currentState, ...partial }
      
      localStorage.setItem(CURRENT_KEY, JSON.stringify(newState))
    } catch (error) {
      console.error('Errore nel salvataggio dello stato:', error)
    }
  }

  async migrateIfNeeded(): Promise<boolean> {
    if (!this.isClient) return false

    try {
      // Controlla se esiste già il nuovo formato
      const newFormat = localStorage.getItem(CURRENT_KEY)
      if (newFormat) {
        const parsed = JSON.parse(newFormat)
        const schemaVersion = parsed.state?.meta?.schemaVersion || parsed.meta?.schemaVersion || 0
        
        if (schemaVersion >= 1) {
          return false // Già migrato
        }
      }

      // Carica dati legacy e migra
      const legacyData = await this.loadLegacyData()
      if (!legacyData) return false

      const migratedData = await migrateData(legacyData)
      
      // Salva i dati migrati
      await this.saveState(migratedData)
      
      return true
    } catch (error) {
      console.error('Errore durante la migrazione:', error)
      return false
    }
  }

  async clearStorage(): Promise<void> {
    if (!this.isClient) return

    try {
      // Rimuovi sia le chiavi legacy che quella nuova
      Object.values(LEGACY_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      localStorage.removeItem(CURRENT_KEY)
    } catch (error) {
      console.error('Errore nella pulizia dello storage:', error)
    }
  }

  // ============================================================================
  // METODI PRIVATI
  // ============================================================================

  private async loadLegacyData(): Promise<Partial<DataStore> | null> {
    try {
      // Carica onboarding
      const onboardingData = this.loadOnboardingData()
      
      // Carica entities
      const entities: Entities = {
        refrigerators: this.loadLegacyArray(LEGACY_KEYS.REFRIGERATORS),
        temperatures: this.loadLegacyArray(LEGACY_KEYS.TEMPERATURES),
        cleaning: this.loadLegacyArray(LEGACY_KEYS.CLEANING),
        staff: this.loadLegacyArray(LEGACY_KEYS.STAFF),
        inventory: this.loadLegacyArray(LEGACY_KEYS.INVENTORY),
        departments: this.loadLegacyArray(LEGACY_KEYS.DEPARTMENTS),
        suppliers: this.loadLegacyArray(LEGACY_KEYS.SUPPLIERS)
      }

      // Carica meta
      const meta: Meta = {
        schemaVersion: 0, // Sarà aggiornato dalla migrazione
        lastSync: localStorage.getItem(LEGACY_KEYS.LAST_SYNC),
        devMode: import.meta.env.DEV,
        forms: {},
        errors: [],
        ui: {
          activeTab: 'home',
          showOnboarding: false,
          onboardingCompleted: !!onboardingData
        }
      }

      return {
        onboarding: onboardingData,
        entities,
        meta
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati legacy:', error)
      return null
    }
  }

  private loadOnboardingData(): OnboardingData {
    try {
      // Prova prima la chiave nuova, poi quella legacy
      const newData = localStorage.getItem(LEGACY_KEYS.ONBOARDING_NEW)
      const legacyData = localStorage.getItem(LEGACY_KEYS.ONBOARDING)
      
      const data = newData || legacyData
      if (!data) return {}

      // Gestisci sia stringhe JSON che oggetti JavaScript
      if (typeof data === 'string') {
        return JSON.parse(data)
      }
      
      return data
    } catch (error) {
      console.warn('Errore nel caricamento dei dati onboarding:', error)
      return {}
    }
  }

  private loadLegacyArray(key: string): any[] {
    try {
      const data = localStorage.getItem(key)
      if (!data) return []
      
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.warn(`Errore nel caricamento di ${key}:`, error)
      return []
    }
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const persistenceAdapter = new LocalStoragePersistenceAdapter()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const initializePersistence = async (): Promise<boolean> => {
  try {
    const migrated = await persistenceAdapter.migrateIfNeeded()
    
    if (migrated) {
      console.log('✅ Dati migrati con successo al nuovo formato')
    }
    
    return true
  } catch (error) {
    console.error('❌ Errore nell\'inizializzazione della persistenza:', error)
    return false
  }
}

export const backupCurrentState = async (): Promise<string | null> => {
  try {
    const state = await persistenceAdapter.loadState()
    if (!state) return null
    
    const backup = {
      timestamp: new Date().toISOString(),
      data: state
    }
    
    const backupKey = `haccp-backup-${Date.now()}`
    localStorage.setItem(backupKey, JSON.stringify(backup))
    
    return backupKey
  } catch (error) {
    console.error('Errore nel backup dello stato:', error)
    return null
  }
}

export const restoreFromBackup = async (backupKey: string): Promise<boolean> => {
  try {
    const backup = localStorage.getItem(backupKey)
    if (!backup) return false
    
    const parsed = JSON.parse(backup)
    await persistenceAdapter.saveState(parsed.data)
    
    return true
  } catch (error) {
    console.error('Errore nel ripristino dal backup:', error)
    return false
  }
}
