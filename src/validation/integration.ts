/**
 * Integrazione Validazione - Foundation Pack v1
 * 
 * Integrazione tra validazione e derivazione
 * Collegamento con commitForm e deriveEntitiesFromOnboarding
 * 
 * @version 1.0
 * @critical Architettura - Integrazione validazione
 */

import { validationService, ValidationResult, HACCPValidationResult } from './validationService'
import { deriveEntitiesFromOnboarding, DerivationResult } from '../derivation/deriveEntitiesFromOnboarding'
import { useDataStore } from '../store/dataStore'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface ValidationIntegrationResult {
  success: boolean
  validation: ValidationResult
  derivation?: DerivationResult
  errors: string[]
  warnings: string[]
}

export interface FormCommitResult {
  success: boolean
  entityId?: string
  validation: ValidationResult
  errors: string[]
  warnings: string[]
}

// ============================================================================
// INTEGRAZIONE CON DERIVAZIONE
// ============================================================================

export const validateAndDeriveFromOnboarding = async (
  onboardingData: any
): Promise<ValidationIntegrationResult> => {
  try {
    console.log('🔄 Validazione e derivazione dall\'onboarding...')
    
    // 1. Valida i dati di onboarding
    const onboardingValidation = validationService.validateOnboardingComplete(onboardingData)
    
    if (!onboardingValidation.isValid) {
      return {
        success: false,
        validation: onboardingValidation,
        errors: onboardingValidation.errors,
        warnings: onboardingValidation.warnings
      }
    }
    
    // 2. Deriva le entities
    const derivationResult = deriveEntitiesFromOnboarding(onboardingData)
    
    if (!derivationResult.success) {
      return {
        success: false,
        validation: onboardingValidation,
        derivation: derivationResult,
        errors: derivationResult.errors,
        warnings: derivationResult.warnings
      }
    }
    
    // 3. Valida la consistenza delle entities derivate
    const consistencyValidation = validationService.validateDataConsistency(derivationResult.entities)
    
    const allErrors = [
      ...onboardingValidation.errors,
      ...derivationResult.errors,
      ...consistencyValidation.errors
    ]
    
    const allWarnings = [
      ...onboardingValidation.warnings,
      ...derivationResult.warnings,
      ...consistencyValidation.warnings
    ]
    
    const success = allErrors.length === 0
    
    return {
      success,
      validation: {
        isValid: success,
        errors: allErrors,
        warnings: allWarnings
      },
      derivation: derivationResult,
      errors: allErrors,
      warnings: allWarnings
    }
    
  } catch (error) {
    const errorMsg = `Errore nell'integrazione validazione-derivazione: ${error}`
    console.error('❌', errorMsg)
    
    return {
      success: false,
      validation: {
        isValid: false,
        errors: [errorMsg],
        warnings: []
      },
      errors: [errorMsg],
      warnings: []
    }
  }
}

// ============================================================================
// INTEGRAZIONE CON FORM COMMIT
// ============================================================================

export const commitFormWithValidation = async (
  entityType: string,
  data: any,
  mode: 'create' | 'update' = 'create'
): Promise<FormCommitResult> => {
  try {
    console.log(`🔄 Commit form ${entityType} in modalità ${mode}...`)
    
    // 1. Valida i dati del form
    const formValidation = validationService.validateForm(entityType, data, mode)
    
    if (!formValidation.isValid) {
      return {
        success: false,
        validation: formValidation,
        errors: formValidation.errors,
        warnings: formValidation.warnings
      }
    }
    
    // 2. Prepara i dati per il commit
    const entityData = prepareEntityData(entityType, data, mode)
    
    // 3. Esegui il commit tramite lo store
    const commitResult = await commitToStore(entityType, entityData, mode)
    
    if (!commitResult.success) {
      return {
        success: false,
        validation: formValidation,
        errors: [commitResult.error || 'Errore nel commit'],
        warnings: formValidation.warnings
      }
    }
    
    return {
      success: true,
      entityId: commitResult.entityId,
      validation: formValidation,
      errors: [],
      warnings: formValidation.warnings
    }
    
  } catch (error) {
    const errorMsg = `Errore nel commit del form ${entityType}: ${error}`
    console.error('❌', errorMsg)
    
    return {
      success: false,
      validation: {
        isValid: false,
        errors: [errorMsg],
        warnings: []
      },
      errors: [errorMsg],
      warnings: []
    }
  }
}

// ============================================================================
// INTEGRAZIONE CON HACCP VALIDATION
// ============================================================================

export const validateHACCPCompliance = async (
  refrigeratorId: string,
  temperature: number,
  targetTemp: number,
  tolerance: number = 2
): Promise<HACCPValidationResult> => {
  try {
    const complianceData = {
      refrigeratorId,
      temperature,
      targetTemp,
      tolerance
    }
    
    return validationService.validateHACCPCompliance(complianceData)
    
  } catch (error) {
    const errorMsg = `Errore nella validazione HACCP: ${error}`
    console.error('❌', errorMsg)
    
    return {
      isValid: false,
      errors: [errorMsg],
      warnings: [],
      complianceStatus: 'unknown',
      recommendations: []
    }
  }
}

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

const prepareEntityData = (entityType: string, data: any, mode: 'create' | 'update'): any => {
  const now = new Date().toISOString()
  
  switch (entityType) {
    case 'refrigerators':
      return {
        ...data,
        ...(mode === 'create' ? { createdAt: now, updatedAt: now } : { updatedAt: now })
      }
    case 'temperatures':
      return {
        ...data,
        ...(mode === 'create' ? { timestamp: now } : {})
      }
    case 'cleaning':
      return {
        ...data,
        ...(mode === 'create' ? { timestamp: now } : {})
      }
    case 'staff':
      return {
        ...data,
        ...(mode === 'create' ? { createdAt: now } : {})
      }
    case 'inventory':
      return {
        ...data,
        // Inventory non ha timestamp automatici
      }
    case 'departments':
      return {
        ...data,
        ...(mode === 'create' ? { createdAt: now } : {})
      }
    case 'suppliers':
      return {
        ...data,
        ...(mode === 'create' ? { createdAt: now } : {})
      }
    default:
      return data
  }
}

const commitToStore = async (
  entityType: string,
  data: any,
  mode: 'create' | 'update'
): Promise<{ success: boolean; entityId?: string; error?: string }> => {
  try {
    const store = useDataStore.getState()
    
    if (mode === 'create') {
      const entityId = data.id || generateId(entityType)
      const entityWithId = { ...data, id: entityId }
      
      store.addEntity(entityType as any, entityWithId)
      
      return {
        success: true,
        entityId
      }
    } else {
      const entityId = data.id
      if (!entityId) {
        return {
          success: false,
          error: 'ID entità mancante per l\'aggiornamento'
        }
      }
      
      store.updateEntity(entityType as any, entityId, data)
      
      return {
        success: true,
        entityId
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: `Errore nel commit allo store: ${error}`
    }
  }
}

const generateId = (entityType: string): string => {
  return `${entityType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// HOOKS DI INTEGRAZIONE
// ============================================================================

export const useValidationIntegration = () => {
  const validateAndDerive = async (onboardingData: any) => {
    return validateAndDeriveFromOnboarding(onboardingData)
  }
  
  const commitForm = async (entityType: string, data: any, mode: 'create' | 'update' = 'create') => {
    return commitFormWithValidation(entityType, data, mode)
  }
  
  const validateHACCP = async (refrigeratorId: string, temperature: number, targetTemp: number, tolerance: number = 2) => {
    return validateHACCPCompliance(refrigeratorId, temperature, targetTemp, tolerance)
  }
  
  return {
    validateAndDerive,
    commitForm,
    validateHACCP
  }
}

// ============================================================================
// EXPORT PRINCIPALI
// ============================================================================

export {
  validateAndDeriveFromOnboarding,
  commitFormWithValidation,
  validateHACCPCompliance
}
