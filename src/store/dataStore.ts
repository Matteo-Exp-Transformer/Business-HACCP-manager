/**
 * Data Store Unificato - Foundation Pack v1
 * 
 * Store centralizzato con Zustand per gestire:
 * - onboarding: dati configurazione iniziale (immutabili in prod)
 * - entities: dati operativi delle tab (refrigerators, temperatures, etc.)
 * - meta: versione schema, stato form, errori, flag dev
 * 
 * @version 1.0
 * @critical Architettura - Store unificato
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ============================================================================
// TIPI E INTERFACCE
// ============================================================================

export interface OnboardingData {
  businessInfo?: {
    businessName?: string
    businessType?: string
    address?: string
    phone?: string
    email?: string
    vatNumber?: string
  }
  departments?: Array<{
    id: string
    name: string
    enabled: boolean
  }>
  staff?: Array<{
    id: string
    fullName: string
    role: string
    department: string
    email?: string
    phone?: string
  }>
  refrigerators?: Array<{
    id: string
    name: string
    location: string
    targetTemp: number
    selectedCategories: string[]
    isAbbattitore?: boolean
  }>
  suppliers?: Array<{
    id: string
    name: string
    category: string
    contact: string
    documentation: string
  }>
}

export interface Entities {
  refrigerators: Array<{
    id: string
    name: string
    location: string
    targetTemp: number
    selectedCategories: string[]
    isAbbattitore?: boolean
    createdAt: string
    updatedAt: string
  }>
  temperatures: Array<{
    id: string
    refrigeratorId: string
    temperature: number
    status: 'ok' | 'warning' | 'danger'
    timestamp: string
    operator: string
  }>
  cleaning: Array<{
    id: string
    area: string
    frequency: string
    product: string
    operator: string
    completed: boolean
    timestamp: string
    department: string
  }>
  staff: Array<{
    id: string
    fullName: string
    role: string
    department: string
    email?: string
    phone?: string
    haccpTraining: boolean
    createdAt: string
  }>
  inventory: Array<{
    id: string
    name: string
    category: string
    supplier: string
    receivedDate: string
    expiryDate: string
    quantity: number
    unit: string
    location: string
    status: 'fresh' | 'expiring' | 'expired'
  }>
  departments: Array<{
    id: string
    name: string
    enabled: boolean
    createdAt: string
  }>
  suppliers: Array<{
    id: string
    name: string
    category: string
    contact: string
    documentation: string
    createdAt: string
  }>
}

export interface FormState {
  mode: 'idle' | 'create' | 'edit'
  editId?: string
  draft: Record<string, any>
  errors: Record<string, string>
}

export interface Meta {
  schemaVersion: number
  lastSync: string | null
  devMode: boolean
  forms: Record<string, FormState>
  errors: Array<{
    id: string
    type: 'validation' | 'network' | 'system'
    message: string
    timestamp: string
    resolved: boolean
  }>
  ui: {
    activeTab: string
    showOnboarding: boolean
    onboardingCompleted: boolean
  }
}

export interface DataStore {
  // State
  onboarding: OnboardingData
  entities: Entities
  meta: Meta
  
  // Mutations - Entities
  addEntity: <K extends keyof Entities>(entityType: K, entity: Entities[K][0]) => void
  updateEntity: <K extends keyof Entities>(entityType: K, id: string, updates: Partial<Entities[K][0]>) => void
  removeEntity: <K extends keyof Entities>(entityType: K, id: string) => void
  
  // Mutations - UI
  openCreateForm: (entityType: string) => void
  openEditForm: (entityType: string, id: string) => void
  closeForm: (entityType: string) => void
  updateDraft: (entityType: string, partial: Record<string, any>) => void
  setFormErrors: (entityType: string, errors: Record<string, string>) => void
  
  // Mutations - Meta
  setActiveTab: (tab: string) => void
  setOnboardingCompleted: (completed: boolean) => void
  setDevMode: (enabled: boolean) => void
  addError: (error: Omit<Meta['errors'][0], 'id' | 'timestamp'>) => void
  resolveError: (errorId: string) => void
  
  // Actions
  resetStore: () => void
  loadFromOnboarding: (onboardingData: OnboardingData) => void
}

// ============================================================================
// STATO INIZIALE
// ============================================================================

const initialOnboarding: OnboardingData = {}

const initialEntities: Entities = {
  refrigerators: [],
  temperatures: [],
  cleaning: [],
  staff: [],
  inventory: [],
  departments: [],
  suppliers: []
}

const initialMeta: Meta = {
  schemaVersion: 1,
  lastSync: null,
  devMode: import.meta.env.DEV,
  forms: {},
  errors: [],
  ui: {
    activeTab: 'home',
    showOnboarding: false,
    onboardingCompleted: false
  }
}

// ============================================================================
// STORE ZUSTAND
// ============================================================================

export const useDataStore = create<DataStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        onboarding: initialOnboarding,
        entities: initialEntities,
        meta: initialMeta,

        // Mutations - Entities
        addEntity: (entityType, entity) => {
          set((state) => {
            const now = new Date().toISOString()
            const entityWithTimestamps = {
              ...entity,
              createdAt: now,
              updatedAt: now
            }
            state.entities[entityType].push(entityWithTimestamps as any)
          })
        },

        updateEntity: (entityType, id, updates) => {
          set((state) => {
            const entity = state.entities[entityType].find((e: any) => e.id === id)
            if (entity) {
              Object.assign(entity, updates, { updatedAt: new Date().toISOString() })
            }
          })
        },

        removeEntity: (entityType, id) => {
          set((state) => {
            state.entities[entityType] = state.entities[entityType].filter((e: any) => e.id !== id) as any
          })
        },

        // Mutations - UI
        openCreateForm: (entityType) => {
          set((state) => {
            // Blocca se c'è già un form aperto per la stessa entità
            if (state.meta.forms[entityType]?.mode !== 'idle') {
              state.meta.errors.push({
                id: `form-conflict-${Date.now()}`,
                type: 'validation',
                message: `Un form per ${entityType} è già aperto. Chiudilo prima di aprirne un altro.`,
                timestamp: new Date().toISOString(),
                resolved: false
              })
              return
            }

            state.meta.forms[entityType] = {
              mode: 'create',
              draft: {},
              errors: {}
            }
          })
        },

        openEditForm: (entityType, id) => {
          set((state) => {
            // Blocca se c'è già un form aperto per la stessa entità
            if (state.meta.forms[entityType]?.mode !== 'idle') {
              state.meta.errors.push({
                id: `form-conflict-${Date.now()}`,
                type: 'validation',
                message: `Un form per ${entityType} è già aperto. Chiudilo prima di aprirne un altro.`,
                timestamp: new Date().toISOString(),
                resolved: false
              })
              return
            }

            const entity = state.entities[entityType].find((e: any) => e.id === id)
            if (entity) {
              state.meta.forms[entityType] = {
                mode: 'edit',
                editId: id,
                draft: { ...entity },
                errors: {}
              }
            }
          })
        },

        closeForm: (entityType) => {
          set((state) => {
            state.meta.forms[entityType] = {
              mode: 'idle',
              draft: {},
              errors: {}
            }
          })
        },

        updateDraft: (entityType, partial) => {
          set((state) => {
            if (state.meta.forms[entityType]) {
              state.meta.forms[entityType].draft = {
                ...state.meta.forms[entityType].draft,
                ...partial
              }
            }
          })
        },

        setFormErrors: (entityType, errors) => {
          set((state) => {
            if (state.meta.forms[entityType]) {
              state.meta.forms[entityType].errors = errors
            }
          })
        },

        // Mutations - Meta
        setActiveTab: (tab) => {
          set((state) => {
            state.meta.ui.activeTab = tab
          })
        },

        setOnboardingCompleted: (completed) => {
          set((state) => {
            state.meta.ui.onboardingCompleted = completed
          })
        },

        setDevMode: (enabled) => {
          set((state) => {
            state.meta.devMode = enabled
          })
        },

        addError: (error) => {
          set((state) => {
            state.meta.errors.push({
              ...error,
              id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString()
            })
          })
        },

        resolveError: (errorId) => {
          set((state) => {
            const error = state.meta.errors.find(e => e.id === errorId)
            if (error) {
              error.resolved = true
            }
          })
        },

        // Actions
        resetStore: () => {
          set((state) => {
            state.onboarding = initialOnboarding
            state.entities = initialEntities
            state.meta = initialMeta
          })
        },

        loadFromOnboarding: (onboardingData) => {
          set((state) => {
            state.onboarding = onboardingData
            // La derivazione delle entities sarà gestita separatamente
          })
        }
      })),
      {
        name: 'haccp-data-store',
        version: 1,
        // Solo in dev persistiamo tutto, in prod solo le entities
        partialize: (state) => ({
          entities: state.entities,
          meta: {
            ...state.meta,
            devMode: false // Non persistiamo il dev mode
          }
        })
      }
    ),
    {
      name: 'haccp-data-store'
    }
  )
)

// ============================================================================
// SELETTORI PURI
// ============================================================================

export const selectRefrigerators = (state: DataStore) => state.entities.refrigerators
export const selectTemperatures = (state: DataStore) => state.entities.temperatures
export const selectCleaning = (state: DataStore) => state.entities.cleaning
export const selectStaff = (state: DataStore) => state.entities.staff
export const selectInventory = (state: DataStore) => state.entities.inventory
export const selectDepartments = (state: DataStore) => state.entities.departments
export const selectSuppliers = (state: DataStore) => state.entities.suppliers

export const selectOnboarding = (state: DataStore) => state.onboarding
export const selectMeta = (state: DataStore) => state.meta
export const selectActiveTab = (state: DataStore) => state.meta.ui.activeTab
export const selectOnboardingCompleted = (state: DataStore) => state.meta.ui.onboardingCompleted
export const selectDevMode = (state: DataStore) => state.meta.devMode

export const selectFormState = (entityType: string) => (state: DataStore) => 
  state.meta.forms[entityType] || { mode: 'idle', draft: {}, errors: {} }

export const selectErrors = (state: DataStore) => state.meta.errors.filter(e => !e.resolved)

// ============================================================================
// HOOKS DI CONVENIENZA
// ============================================================================

export const useRefrigerators = () => useDataStore(selectRefrigerators)
export const useTemperatures = () => useDataStore(selectTemperatures)
export const useCleaning = () => useDataStore(selectCleaning)
export const useStaff = () => useDataStore(selectStaff)
export const useInventory = () => useDataStore(selectInventory)
export const useDepartments = () => useDataStore(selectDepartments)
export const useSuppliers = () => useDataStore(selectSuppliers)

export const useOnboarding = () => useDataStore(selectOnboarding)
export const useMeta = () => useDataStore(selectMeta)
export const useActiveTab = () => useDataStore(selectActiveTab)
export const useOnboardingCompleted = () => useDataStore(selectOnboardingCompleted)
export const useDevMode = () => useDataStore(selectDevMode)

export const useFormState = (entityType: string) => useDataStore(selectFormState(entityType))
export const useErrors = () => useDataStore(selectErrors)
