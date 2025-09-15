/**
 * Migrazioni Automatiche - Foundation Pack v1
 * 
 * Sistema di migrazioni per aggiornare i dati esistenti
 * Supporta migrazioni per entità e migrazioni di release
 * 
 * @version 1.0
 * @critical Architettura - Migrazioni dati
 */

import { DataStore, OnboardingData, Entities, Meta } from '../store/dataStore'

// ============================================================================
// INTERFACCE MIGRAZIONI
// ============================================================================

export interface Migration {
  version: number
  name: string
  description: string
  up: (data: any) => any
  down?: (data: any) => any
}

export interface MigrationResult {
  success: boolean
  migrated: boolean
  errors: string[]
  warnings: string[]
}

// ============================================================================
// MIGRAZIONI PER ENTITÀ
// ============================================================================

const migrateRefrigerators = (refrigerators: any[]): any[] => {
  return refrigerators.map(ref => ({
    ...ref,
    // Aggiungi campi mancanti
    createdAt: ref.createdAt || new Date().toISOString(),
    updatedAt: ref.updatedAt || new Date().toISOString(),
    // Normalizza temperatura
    targetTemp: parseFloat(ref.targetTemp?.toString() || '4'),
    // Normalizza categorie
    selectedCategories: Array.isArray(ref.selectedCategories) ? ref.selectedCategories : [],
    // Aggiungi flag abbattitore se mancante
    isAbbattitore: ref.isAbbattitore || false
  }))
}

const migrateTemperatures = (temperatures: any[]): any[] => {
  return temperatures.map(temp => ({
    ...temp,
    // Normalizza temperatura
    temperature: parseFloat(temp.temperature?.toString() || '0'),
    // Normalizza status
    status: ['ok', 'warning', 'danger'].includes(temp.status) ? temp.status : 'ok',
    // Aggiungi timestamp se mancante
    timestamp: temp.timestamp || new Date().toISOString(),
    // Aggiungi operatore se mancante
    operator: temp.operator || 'Sistema'
  }))
}

const migrateCleaning = (cleaning: any[]): any[] => {
  return cleaning.map(task => ({
    ...task,
    // Normalizza completed
    completed: Boolean(task.completed),
    // Aggiungi timestamp se mancante
    timestamp: task.timestamp || new Date().toISOString(),
    // Normalizza department
    department: task.department || 'Generale'
  }))
}

const migrateStaff = (staff: any[]): any[] => {
  return staff.map(member => ({
    ...member,
    // Aggiungi campi mancanti
    createdAt: member.createdAt || new Date().toISOString(),
    // Normalizza haccpTraining
    haccpTraining: Boolean(member.haccpTraining),
    // Normalizza email e phone
    email: member.email || '',
    phone: member.phone || ''
  }))
}

const migrateInventory = (inventory: any[]): any[] => {
  return inventory.map(item => ({
    ...item,
    // Normalizza status
    status: ['fresh', 'expiring', 'expired'].includes(item.status) ? item.status : 'fresh',
    // Normalizza quantità
    quantity: parseFloat(item.quantity?.toString() || '1'),
    // Aggiungi unità se mancante
    unit: item.unit || 'pz',
    // Normalizza date
    receivedDate: item.receivedDate || new Date().toISOString(),
    expiryDate: item.expiryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }))
}

const migrateDepartments = (departments: any[]): any[] => {
  return departments.map(dept => ({
    ...dept,
    // Aggiungi campi mancanti
    createdAt: dept.createdAt || new Date().toISOString(),
    // Normalizza enabled
    enabled: Boolean(dept.enabled),
    // Pulisci nomi corrotti
    name: cleanDepartmentName(dept.name)
  }))
}

const migrateSuppliers = (suppliers: any[]): any[] => {
  return suppliers.map(supplier => ({
    ...supplier,
    // Aggiungi campi mancanti
    createdAt: supplier.createdAt || new Date().toISOString(),
    // Normalizza campi
    contact: supplier.contact || '',
    documentation: supplier.documentation || ''
  }))
}

// ============================================================================
// MIGRAZIONI DI RELEASE
// ============================================================================

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Foundation Pack v1',
    description: 'Migrazione iniziale al nuovo formato unificato',
    up: (data: Partial<DataStore>) => {
      const result: Partial<DataStore> = {
        ...data,
        meta: {
          ...data.meta,
          schemaVersion: 1,
          devMode: import.meta.env.DEV,
          forms: {},
          errors: [],
          ui: {
            activeTab: 'home',
            showOnboarding: false,
            onboardingCompleted: !!data.onboarding
          }
        }
      }

      // Migra entities se presenti
      if (data.entities) {
        result.entities = {
          refrigerators: migrateRefrigerators(data.entities.refrigerators || []),
          temperatures: migrateTemperatures(data.entities.temperatures || []),
          cleaning: migrateCleaning(data.entities.cleaning || []),
          staff: migrateStaff(data.entities.staff || []),
          inventory: migrateInventory(data.entities.inventory || []),
          departments: migrateDepartments(data.entities.departments || []),
          suppliers: migrateSuppliers(data.entities.suppliers || [])
        }
      }

      return result
    }
  }
]

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

const cleanDepartmentName = (name: string): string => {
  if (!name || typeof name !== 'string') return 'Reparto Generale'
  
  // Rimuovi nomi corrotti
  const corruptedNames = [
    'Amministratori',
    'Responsabili', 
    'Dipendenti',
    'Collaboratore Occasionale'
  ]
  
  if (corruptedNames.includes(name)) {
    return 'Reparto Generale'
  }
  
  // Rimuovi nomi numerici
  if (/^\d+$/.test(name)) {
    return 'Reparto Generale'
  }
  
  // Rimuovi nomi troppo corti
  if (name.length < 3) {
    return 'Reparto Generale'
  }
  
  return name
}

const validateMigrationResult = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data) {
    errors.push('Dati mancanti')
    return { valid: false, errors }
  }
  
  if (!data.meta || typeof data.meta.schemaVersion !== 'number') {
    errors.push('Meta.schemaVersion mancante o non valido')
  }
  
  if (!data.entities) {
    errors.push('Entities mancanti')
  }
  
  return { valid: errors.length === 0, errors }
}

// ============================================================================
// FUNZIONE PRINCIPALE DI MIGRAZIONE
// ============================================================================

export const migrateData = async (data: Partial<DataStore>): Promise<Partial<DataStore>> => {
  try {
    let currentData = { ...data }
    const errors: string[] = []
    const warnings: string[] = []
    
    // Determina la versione corrente
    const currentVersion = currentData.meta?.schemaVersion || 0
    const targetVersion = Math.max(...MIGRATIONS.map(m => m.version))
    
    if (currentVersion >= targetVersion) {
      return currentData
    }
    
    // Applica migrazioni in sequenza
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        try {
          console.log(`🔄 Applicando migrazione: ${migration.name}`)
          currentData = migration.up(currentData)
          
          // Valida il risultato
          const validation = validateMigrationResult(currentData)
          if (!validation.valid) {
            errors.push(...validation.errors)
            warnings.push(`Migrazione ${migration.name} completata con errori di validazione`)
          }
          
        } catch (error) {
          const errorMsg = `Errore nella migrazione ${migration.name}: ${error}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }
    }
    
    // Log del risultato
    if (errors.length > 0) {
      console.warn('⚠️ Migrazione completata con errori:', errors)
    } else {
      console.log('✅ Migrazione completata con successo')
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Avvisi durante la migrazione:', warnings)
    }
    
    return currentData
    
  } catch (error) {
    console.error('❌ Errore critico durante la migrazione:', error)
    throw error
  }
}

// ============================================================================
// FUNZIONI DI UTILITÀ PER MIGRAZIONI FUTURE
// ============================================================================

export const addMigration = (migration: Migration): void => {
  MIGRATIONS.push(migration)
  MIGRATIONS.sort((a, b) => a.version - b.version)
}

export const getMigrationHistory = (): Migration[] => {
  return [...MIGRATIONS]
}

export const rollbackMigration = async (data: Partial<DataStore>, targetVersion: number): Promise<Partial<DataStore>> => {
  try {
    let currentData = { ...data }
    const currentVersion = currentData.meta?.schemaVersion || 0
    
    if (currentVersion <= targetVersion) {
      return currentData
    }
    
    // Applica rollback in ordine inverso
    const rollbackMigrations = MIGRATIONS
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version)
    
    for (const migration of rollbackMigrations) {
      if (migration.down) {
        console.log(`🔄 Rollback migrazione: ${migration.name}`)
        currentData = migration.down(currentData)
      } else {
        console.warn(`⚠️ Rollback non supportato per migrazione: ${migration.name}`)
      }
    }
    
    return currentData
    
  } catch (error) {
    console.error('❌ Errore durante il rollback:', error)
    throw error
  }
}
