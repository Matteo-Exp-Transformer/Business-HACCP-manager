/**
 * Servizio di Validazione Centralizzato - Foundation Pack v1
 * 
 * Servizio unificato per validazione HACCP
 * Integra regole esistenti con schemi Zod
 * 
 * @version 1.0
 * @critical Architettura - Validazione centralizzata
 */

import { 
  validateRefrigerator,
  validateRefrigeratorCreate,
  validateRefrigeratorUpdate,
  validateTemperature,
  validateTemperatureCreate,
  validateCleaning,
  validateCleaningCreate,
  validateStaff,
  validateStaffCreate,
  validateInventory,
  validateInventoryCreate,
  validateDepartment,
  validateDepartmentCreate,
  validateSupplier,
  validateSupplierCreate,
  validateHACCPCompliance,
  validateTemperatureRange,
  validateTemperatureTolerance,
  validateExpiryDate,
  validateExpiryWarning
} from './schemas/entities'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface HACCPValidationResult extends ValidationResult {
  complianceStatus: 'compliant' | 'warning' | 'critical' | 'unknown'
  recommendations: string[]
}

export interface FormValidationResult extends ValidationResult {
  fieldErrors: Record<string, string>
}

// ============================================================================
// SERVIZIO DI VALIDAZIONE PRINCIPALE
// ============================================================================

export class ValidationService {
  private static instance: ValidationService
  
  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService()
    }
    return ValidationService.instance
  }

  // ============================================================================
  // VALIDAZIONI ENTITIES
  // ============================================================================

  validateRefrigerator = (data: unknown): ValidationResult => {
    const result = validateRefrigerator(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateRefrigeratorCreate = (data: unknown): ValidationResult => {
    const result = validateRefrigeratorCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateRefrigeratorUpdate = (data: unknown): ValidationResult => {
    const result = validateRefrigeratorUpdate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateTemperature = (data: unknown): ValidationResult => {
    const result = validateTemperature(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateTemperatureCreate = (data: unknown): ValidationResult => {
    const result = validateTemperatureCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateCleaning = (data: unknown): ValidationResult => {
    const result = validateCleaning(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateCleaningCreate = (data: unknown): ValidationResult => {
    const result = validateCleaningCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateStaff = (data: unknown): ValidationResult => {
    const result = validateStaff(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateStaffCreate = (data: unknown): ValidationResult => {
    const result = validateStaffCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateInventory = (data: unknown): ValidationResult => {
    const result = validateInventory(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateInventoryCreate = (data: unknown): ValidationResult => {
    const result = validateInventoryCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateDepartment = (data: unknown): ValidationResult => {
    const result = validateDepartment(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateDepartmentCreate = (data: unknown): ValidationResult => {
    const result = validateDepartmentCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateSupplier = (data: unknown): ValidationResult => {
    const result = validateSupplier(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  validateSupplierCreate = (data: unknown): ValidationResult => {
    const result = validateSupplierCreate(data)
    return {
      isValid: result.success,
      errors: result.errors,
      warnings: []
    }
  }

  // ============================================================================
  // VALIDAZIONI HACCP SPECIFICHE
  // ============================================================================

  validateHACCPCompliance = (data: unknown): HACCPValidationResult => {
    const result = validateHACCPCompliance(data)
    
    if (!result.success) {
      return {
        isValid: false,
        errors: result.errors,
        warnings: [],
        complianceStatus: 'unknown',
        recommendations: []
      }
    }

    const { refrigeratorId, temperature, targetTemp, tolerance } = result.data!
    
    const isCompliant = validateTemperatureTolerance(temperature, targetTemp, tolerance)
    const complianceStatus = isCompliant ? 'compliant' : 'critical'
    
    const recommendations: string[] = []
    if (!isCompliant) {
      recommendations.push(`Temperatura ${temperature}°C fuori range target ${targetTemp}°C (±${tolerance}°C)`)
      recommendations.push('Verificare funzionamento del frigorifero')
      recommendations.push('Contattare tecnico se il problema persiste')
    }

    return {
      isValid: isCompliant,
      errors: isCompliant ? [] : [`Temperatura fuori range: ${temperature}°C vs ${targetTemp}°C`],
      warnings: [],
      complianceStatus,
      recommendations
    }
  }

  validateTemperatureRange = (temp: number, min: number, max: number): ValidationResult => {
    const isValid = validateTemperatureRange(temp, min, max)
    
    return {
      isValid,
      errors: isValid ? [] : [`Temperatura ${temp}°C fuori range ${min}-${max}°C`],
      warnings: []
    }
  }

  validateExpiryDate = (expiryDate: string): ValidationResult => {
    const isValid = validateExpiryDate(expiryDate)
    const isWarning = validateExpiryWarning(expiryDate)
    
    return {
      isValid,
      errors: isValid ? [] : ['Data di scadenza già passata'],
      warnings: isWarning ? ['Prodotto in scadenza tra meno di 3 giorni'] : []
    }
  }

  // ============================================================================
  // VALIDAZIONI FORM
  // ============================================================================

  validateForm = (entityType: string, data: unknown, mode: 'create' | 'update' = 'create'): FormValidationResult => {
    let result: ValidationResult
    
    switch (entityType) {
      case 'refrigerators':
        result = mode === 'create' ? this.validateRefrigeratorCreate(data) : this.validateRefrigeratorUpdate(data)
        break
      case 'temperatures':
        result = mode === 'create' ? this.validateTemperatureCreate(data) : this.validateTemperature(data)
        break
      case 'cleaning':
        result = mode === 'create' ? this.validateCleaningCreate(data) : this.validateCleaning(data)
        break
      case 'staff':
        result = mode === 'create' ? this.validateStaffCreate(data) : this.validateStaff(data)
        break
      case 'inventory':
        result = mode === 'create' ? this.validateInventoryCreate(data) : this.validateInventory(data)
        break
      case 'departments':
        result = mode === 'create' ? this.validateDepartmentCreate(data) : this.validateDepartment(data)
        break
      case 'suppliers':
        result = mode === 'create' ? this.validateSupplierCreate(data) : this.validateSupplier(data)
        break
      default:
        return {
          isValid: false,
          errors: [`Tipo entità non supportato: ${entityType}`],
          warnings: [],
          fieldErrors: {}
        }
    }

    // Converti errori in fieldErrors
    const fieldErrors: Record<string, string> = {}
    result.errors.forEach(error => {
      const match = error.match(/^([^.]+):\s*(.+)$/)
      if (match) {
        fieldErrors[match[1]] = match[2]
      } else {
        fieldErrors['general'] = error
      }
    })

    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
      fieldErrors
    }
  }

  // ============================================================================
  // VALIDAZIONI BUSINESS LOGIC
  // ============================================================================

  validateOnboardingComplete = (onboardingData: any): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Controlla reparti
    if (!onboardingData.departments || onboardingData.departments.length === 0) {
      errors.push('Almeno un reparto è obbligatorio')
    }

    // Controlla staff
    if (!onboardingData.staff || onboardingData.staff.length === 0) {
      errors.push('Almeno un membro dello staff è obbligatorio')
    }

    // Controlla frigoriferi
    if (!onboardingData.refrigerators || onboardingData.refrigerators.length === 0) {
      errors.push('Almeno un frigorifero è obbligatorio')
    }

    // Controlla formazione HACCP
    if (onboardingData.staff) {
      const trainedStaff = onboardingData.staff.filter((s: any) => s.haccpTraining)
      if (trainedStaff.length === 0) {
        warnings.push('Nessun membro dello staff ha formazione HACCP')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  validateDataConsistency = (entities: any): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Controlla consistenza tra refrigerators e temperatures
    if (entities.refrigerators && entities.temperatures) {
      const refrigeratorIds = new Set(entities.refrigerators.map((r: any) => r.id))
      const orphanTemperatures = entities.temperatures.filter((t: any) => !refrigeratorIds.has(t.refrigeratorId))
      
      if (orphanTemperatures.length > 0) {
        warnings.push(`${orphanTemperatures.length} temperature orfane trovate`)
      }
    }

    // Controlla consistenza tra staff e departments
    if (entities.staff && entities.departments) {
      const departmentIds = new Set(entities.departments.map((d: any) => d.id))
      const invalidStaff = entities.staff.filter((s: any) => !departmentIds.has(s.department))
      
      if (invalidStaff.length > 0) {
        warnings.push(`${invalidStaff.length} membri dello staff con reparto non valido`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

export const validationService = ValidationService.getInstance()

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

export const validateEntity = (entityType: string, data: unknown, mode: 'create' | 'update' = 'create'): ValidationResult => {
  return validationService.validateForm(entityType, data, mode)
}

export const validateHACCP = (data: unknown): HACCPValidationResult => {
  return validationService.validateHACCPCompliance(data)
}

export const validateOnboarding = (data: unknown): ValidationResult => {
  return validationService.validateOnboardingComplete(data)
}

export const validateConsistency = (entities: any): ValidationResult => {
  return validationService.validateDataConsistency(entities)
}
