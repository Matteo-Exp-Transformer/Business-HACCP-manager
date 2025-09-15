/**
 * Derivazione dall'Onboarding - Foundation Pack v1
 * 
 * Funzione pura per derivare le entities dall'onboarding
 * Supporta mirroring in dev e derivazione una tantum in prod
 * 
 * @version 1.0
 * @critical Architettura - Derivazione dati
 */

import { OnboardingData, Entities } from '../store/dataStore'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface DerivationResult {
  success: boolean
  entities: Partial<Entities>
  errors: string[]
  warnings: string[]
}

export interface DerivationConfig {
  mirrorOnboardingChanges: boolean
  validateData: boolean
  strictMode: boolean
}

// ============================================================================
// CONFIGURAZIONE DEFAULT
// ============================================================================

const DEFAULT_CONFIG: DerivationConfig = {
  mirrorOnboardingChanges: import.meta.env.DEV,
  validateData: true,
  strictMode: false
}

// ============================================================================
// FUNZIONE PRINCIPALE DI DERIVAZIONE
// ============================================================================

export const deriveEntitiesFromOnboarding = (
  onboardingData: OnboardingData,
  config: DerivationConfig = DEFAULT_CONFIG
): DerivationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    console.log('🔄 Derivazione entities dall\'onboarding...')
    
    const entities: Partial<Entities> = {}
    
    // 1. Deriva departments
    if (onboardingData.departments) {
      const departmentsResult = deriveDepartments(onboardingData.departments, config)
      entities.departments = departmentsResult.entities
      errors.push(...departmentsResult.errors)
      warnings.push(...departmentsResult.warnings)
    }
    
    // 2. Deriva staff
    if (onboardingData.staff) {
      const staffResult = deriveStaff(onboardingData.staff, config)
      entities.staff = staffResult.entities
      errors.push(...staffResult.errors)
      warnings.push(...staffResult.warnings)
    }
    
    // 3. Deriva refrigerators
    if (onboardingData.refrigerators) {
      const refrigeratorsResult = deriveRefrigerators(onboardingData.refrigerators, config)
      entities.refrigerators = refrigeratorsResult.entities
      errors.push(...refrigeratorsResult.errors)
      warnings.push(...refrigeratorsResult.warnings)
    }
    
    // 4. Deriva suppliers
    if (onboardingData.suppliers) {
      const suppliersResult = deriveSuppliers(onboardingData.suppliers, config)
      entities.suppliers = suppliersResult.entities
      errors.push(...suppliersResult.errors)
      warnings.push(...suppliersResult.warnings)
    }
    
    // 5. Inizializza array vuoti per entities non derivabili
    entities.temperatures = []
    entities.cleaning = []
    entities.inventory = []
    
    const success = errors.length === 0
    
    if (success) {
      console.log('✅ Derivazione completata con successo')
    } else {
      console.warn('⚠️ Derivazione completata con errori:', errors)
    }
    
    if (warnings.length > 0) {
      console.warn('⚠️ Avvisi durante la derivazione:', warnings)
    }
    
    return {
      success,
      entities,
      errors,
      warnings
    }
    
  } catch (error) {
    const errorMsg = `Errore critico durante la derivazione: ${error}`
    console.error('❌', errorMsg)
    
    return {
      success: false,
      entities: {},
      errors: [errorMsg],
      warnings
    }
  }
}

// ============================================================================
// DERIVAZIONI PER ENTITÀ
// ============================================================================

const deriveDepartments = (
  departments: OnboardingData['departments'],
  config: DerivationConfig
): { entities: Entities['departments']; errors: string[]; warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!departments || !Array.isArray(departments)) {
    return { entities: [], errors: ['Departments non validi'], warnings }
  }
  
  const entities: Entities['departments'] = departments
    .filter(dept => dept && dept.enabled)
    .map(dept => ({
      id: dept.id || generateId('dept'),
      name: cleanDepartmentName(dept.name),
      enabled: true,
      createdAt: new Date().toISOString()
    }))
  
  // Validazioni
  if (entities.length === 0) {
    errors.push('Nessun reparto abilitato trovato')
  }
  
  const uniqueNames = new Set(entities.map(d => d.name.toLowerCase()))
  if (uniqueNames.size !== entities.length) {
    errors.push('Nomi reparti duplicati trovati')
  }
  
  return { entities, errors, warnings }
}

const deriveStaff = (
  staff: OnboardingData['staff'],
  config: DerivationConfig
): { entities: Entities['staff']; errors: string[]; warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!staff || !Array.isArray(staff)) {
    return { entities: [], errors: ['Staff non valido'], warnings }
  }
  
  const entities: Entities['staff'] = staff.map(member => ({
    id: member.id || generateId('staff'),
    fullName: member.fullName || 'Nome non specificato',
    role: member.role || 'Dipendente',
    department: member.department || 'Generale',
    email: member.email || '',
    phone: member.phone || '',
    haccpTraining: false, // Da impostare manualmente
    createdAt: new Date().toISOString()
  }))
  
  // Validazioni
  if (entities.length === 0) {
    errors.push('Nessun membro dello staff trovato')
  }
  
  const uniqueNames = new Set(entities.map(s => s.fullName.toLowerCase()))
  if (uniqueNames.size !== entities.length) {
    warnings.push('Nomi staff duplicati trovati')
  }
  
  return { entities, errors, warnings }
}

const deriveRefrigerators = (
  refrigerators: OnboardingData['refrigerators'],
  config: DerivationConfig
): { entities: Entities['refrigerators']; errors: string[]; warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!refrigerators || !Array.isArray(refrigerators)) {
    return { entities: [], errors: ['Refrigerators non validi'], warnings }
  }
  
  const entities: Entities['refrigerators'] = refrigerators.map(ref => ({
    id: ref.id || generateId('ref'),
    name: ref.name || 'Frigorifero non specificato',
    location: ref.location || 'Posizione non specificata',
    targetTemp: parseFloat(ref.targetTemp?.toString() || '4'),
    selectedCategories: Array.isArray(ref.selectedCategories) ? ref.selectedCategories : [],
    isAbbattitore: Boolean(ref.isAbbattitore),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }))
  
  // Validazioni
  if (entities.length === 0) {
    errors.push('Nessun frigorifero trovato')
  }
  
  const uniqueNames = new Set(entities.map(r => r.name.toLowerCase()))
  if (uniqueNames.size !== entities.length) {
    warnings.push('Nomi frigoriferi duplicati trovati')
  }
  
  // Validazione temperature
  entities.forEach(ref => {
    if (ref.targetTemp < -50 || ref.targetTemp > 50) {
      errors.push(`Temperatura non valida per ${ref.name}: ${ref.targetTemp}°C`)
    }
  })
  
  return { entities, errors, warnings }
}

const deriveSuppliers = (
  suppliers: OnboardingData['suppliers'],
  config: DerivationConfig
): { entities: Entities['suppliers']; errors: string[]; warnings: string[] } => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!suppliers || !Array.isArray(suppliers)) {
    return { entities: [], errors: ['Suppliers non validi'], warnings }
  }
  
  const entities: Entities['suppliers'] = suppliers.map(supplier => ({
    id: supplier.id || generateId('supplier'),
    name: supplier.name || 'Fornitore non specificato',
    category: supplier.category || 'Generale',
    contact: supplier.contact || '',
    documentation: supplier.documentation || '',
    createdAt: new Date().toISOString()
  }))
  
  // Validazioni
  const uniqueNames = new Set(entities.map(s => s.name.toLowerCase()))
  if (uniqueNames.size !== entities.length) {
    warnings.push('Nomi fornitori duplicati trovati')
  }
  
  return { entities, errors, warnings }
}

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
  
  return name.trim()
}

const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// FUNZIONI DI UTILITÀ PER CONFIGURAZIONE
// ============================================================================

export const createDerivationConfig = (overrides: Partial<DerivationConfig> = {}): DerivationConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...overrides
  }
}

export const validateOnboardingData = (data: OnboardingData): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!data) {
    errors.push('Dati onboarding mancanti')
    return { valid: false, errors }
  }
  
  // Validazione departments
  if (data.departments) {
    const enabledDepts = data.departments.filter(d => d && d.enabled)
    if (enabledDepts.length === 0) {
      errors.push('Nessun reparto abilitato')
    }
  }
  
  // Validazione staff
  if (data.staff) {
    if (data.staff.length === 0) {
      errors.push('Nessun membro dello staff')
    }
  }
  
  // Validazione refrigerators
  if (data.refrigerators) {
    if (data.refrigerators.length === 0) {
      errors.push('Nessun frigorifero configurato')
    }
  }
  
  return { valid: errors.length === 0, errors }
}
