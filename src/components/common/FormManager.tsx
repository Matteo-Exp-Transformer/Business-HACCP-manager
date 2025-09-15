/**
 * Form Manager - Foundation Pack v1
 * 
 * Gestione form "uno alla volta" con bozza isolata
 * Blocca apertura form multipli della stessa entità
 * 
 * @version 1.0
 * @critical Architettura - Form Manager
 */

import React, { createContext, useContext, useCallback, ReactNode } from 'react'
import { useDataStore } from '../../store/dataStore'
import { validationService } from '../../validation/validationService'
import { formLogger } from '../../utils/logger'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface FormManagerContextType {
  // Form state
  isFormOpen: (entityType: string) => boolean
  getFormState: (entityType: string) => any
  getFormDraft: (entityType: string) => any
  getFormErrors: (entityType: string) => Record<string, string>
  
  // Form actions
  openCreateForm: (entityType: string) => boolean
  openEditForm: (entityType: string, id: string) => boolean
  closeForm: (entityType: string) => void
  updateDraft: (entityType: string, partial: Record<string, any>) => void
  setFormErrors: (entityType: string, errors: Record<string, string>) => void
  
  // Form validation
  validateForm: (entityType: string, data: any, mode: 'create' | 'update') => boolean
  commitForm: (entityType: string, mode: 'create' | 'update') => Promise<boolean>
  
  // Form conflict
  hasFormConflict: (entityType: string) => boolean
  getFormConflictMessage: (entityType: string) => string
}

export interface FormManagerProps {
  children: ReactNode
}

// ============================================================================
// CONTEXT
// ============================================================================

const FormManagerContext = createContext<FormManagerContextType | null>(null)

// ============================================================================
// HOOK
// ============================================================================

export const useFormManager = (): FormManagerContextType => {
  const context = useContext(FormManagerContext)
  if (!context) {
    throw new Error('useFormManager deve essere usato dentro FormManagerProvider')
  }
  return context
}

// ============================================================================
// PROVIDER
// ============================================================================

export const FormManagerProvider: React.FC<FormManagerProps> = ({ children }) => {
  const store = useDataStore()

  // ============================================================================
  // FORM STATE
  // ============================================================================

  const isFormOpen = useCallback((entityType: string): boolean => {
    const formState = store.meta.forms[entityType]
    return formState ? formState.mode !== 'idle' : false
  }, [store.meta.forms])

  const getFormState = useCallback((entityType: string) => {
    return store.meta.forms[entityType] || { mode: 'idle', draft: {}, errors: {} }
  }, [store.meta.forms])

  const getFormDraft = useCallback((entityType: string) => {
    const formState = getFormState(entityType)
    return formState.draft || {}
  }, [getFormState])

  const getFormErrors = useCallback((entityType: string) => {
    const formState = getFormState(entityType)
    return formState.errors || {}
  }, [getFormState])

  // ============================================================================
  // FORM ACTIONS
  // ============================================================================

  const openCreateForm = useCallback((entityType: string): boolean => {
    formLogger.debug(`Tentativo apertura form create per ${entityType}`)
    
    // Controlla se c'è già un form aperto
    if (isFormOpen(entityType)) {
      formLogger.warn(`Form ${entityType} già aperto, bloccando apertura`)
      return false
    }
    
    // Apri il form
    store.openCreateForm(entityType)
    formLogger.info(`Form create aperto per ${entityType}`)
    return true
  }, [store, isFormOpen])

  const openEditForm = useCallback((entityType: string, id: string): boolean => {
    formLogger.debug(`Tentativo apertura form edit per ${entityType} con id ${id}`)
    
    // Controlla se c'è già un form aperto
    if (isFormOpen(entityType)) {
      formLogger.warn(`Form ${entityType} già aperto, bloccando apertura`)
      return false
    }
    
    // Apri il form
    store.openEditForm(entityType, id)
    formLogger.info(`Form edit aperto per ${entityType} con id ${id}`)
    return true
  }, [store, isFormOpen])

  const closeForm = useCallback((entityType: string): void => {
    formLogger.debug(`Chiusura form per ${entityType}`)
    store.closeForm(entityType)
  }, [store])

  const updateDraft = useCallback((entityType: string, partial: Record<string, any>): void => {
    formLogger.debug(`Aggiornamento draft per ${entityType}`, partial)
    store.updateDraft(entityType, partial)
  }, [store])

  const setFormErrors = useCallback((entityType: string, errors: Record<string, string>): void => {
    formLogger.debug(`Impostazione errori per ${entityType}`, errors)
    store.setFormErrors(entityType, errors)
  }, [store])

  // ============================================================================
  // FORM VALIDATION
  // ============================================================================

  const validateForm = useCallback((entityType: string, data: any, mode: 'create' | 'update'): boolean => {
    formLogger.debug(`Validazione form ${entityType} in modalità ${mode}`)
    
    const validation = validationService.validateForm(entityType, data, mode)
    
    if (!validation.isValid) {
      formLogger.warn(`Validazione fallita per ${entityType}`, validation.errors)
      setFormErrors(entityType, validation.fieldErrors)
      return false
    }
    
    // Pulisci errori se validazione passa
    setFormErrors(entityType, {})
    formLogger.info(`Validazione passata per ${entityType}`)
    return true
  }, [setFormErrors])

  const commitForm = useCallback(async (entityType: string, mode: 'create' | 'update'): Promise<boolean> => {
    formLogger.debug(`Commit form ${entityType} in modalità ${mode}`)
    
    const formState = getFormState(entityType)
    if (formState.mode === 'idle') {
      formLogger.warn(`Nessun form attivo per ${entityType}`)
      return false
    }
    
    const draft = formState.draft
    if (!draft || Object.keys(draft).length === 0) {
      formLogger.warn(`Draft vuoto per ${entityType}`)
      return false
    }
    
    // Valida i dati
    if (!validateForm(entityType, draft, mode)) {
      formLogger.error(`Validazione fallita per ${entityType}`)
      return false
    }
    
    try {
      // Esegui il commit
      if (mode === 'create') {
        const entityId = `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const entityData = { ...draft, id: entityId }
        store.addEntity(entityType as any, entityData)
        formLogger.info(`Entità ${entityType} creata con id ${entityId}`)
      } else {
        const entityId = formState.editId
        if (!entityId) {
          formLogger.error(`ID mancante per aggiornamento ${entityType}`)
          return false
        }
        store.updateEntity(entityType as any, entityId, draft)
        formLogger.info(`Entità ${entityType} aggiornata con id ${entityId}`)
      }
      
      // Chiudi il form
      closeForm(entityType)
      formLogger.info(`Form ${entityType} committato con successo`)
      return true
      
    } catch (error) {
      formLogger.error(`Errore nel commit form ${entityType}`, error)
      return false
    }
  }, [getFormState, validateForm, store, closeForm])

  // ============================================================================
  // FORM CONFLICT
  // ============================================================================

  const hasFormConflict = useCallback((entityType: string): boolean => {
    return isFormOpen(entityType)
  }, [isFormOpen])

  const getFormConflictMessage = useCallback((entityType: string): string => {
    const entityNames: Record<string, string> = {
      refrigerators: 'frigorifero',
      temperatures: 'temperatura',
      cleaning: 'pulizia',
      staff: 'membro dello staff',
      inventory: 'prodotto',
      departments: 'reparto',
      suppliers: 'fornitore'
    }
    
    const entityName = entityNames[entityType] || entityType
    return `Un form per ${entityName} è già aperto. Chiudilo prima di aprirne un altro.`
  }, [])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: FormManagerContextType = {
    // Form state
    isFormOpen,
    getFormState,
    getFormDraft,
    getFormErrors,
    
    // Form actions
    openCreateForm,
    openEditForm,
    closeForm,
    updateDraft,
    setFormErrors,
    
    // Form validation
    validateForm,
    commitForm,
    
    // Form conflict
    hasFormConflict,
    getFormConflictMessage
  }

  return (
    <FormManagerContext.Provider value={contextValue}>
      {children}
    </FormManagerContext.Provider>
  )
}

// ============================================================================
// COMPONENTI DI UTILITÀ
// ============================================================================

export const FormGate: React.FC<{
  entityType: string
  children: ReactNode
  fallback?: ReactNode
}> = ({ entityType, children, fallback }) => {
  const { isFormOpen, getFormConflictMessage } = useFormManager()
  
  if (isFormOpen(entityType)) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {getFormConflictMessage(entityType)}
            </p>
          </div>
        </div>
        {fallback}
      </div>
    )
  }
  
  return <>{children}</>
}

export const FormStatus: React.FC<{
  entityType: string
  className?: string
}> = ({ entityType, className = '' }) => {
  const { isFormOpen, getFormState } = useFormManager()
  
  if (!isFormOpen(entityType)) return null
  
  const formState = getFormState(entityType)
  const mode = formState.mode === 'create' ? 'Creazione' : 'Modifica'
  
  return (
    <div className={`p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 ${className}`}>
      Form {mode} attivo
    </div>
  )
}
