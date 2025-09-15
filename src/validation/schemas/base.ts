/**
 * Schemi di Validazione Base - Foundation Pack v1
 * 
 * Schemi Zod per validazione centralizzata
 * Wrapper delle regole HACCP esistenti
 * 
 * @version 1.0
 * @critical Architettura - Validazione centralizzata
 */

import { z } from 'zod'

// ============================================================================
// SCHEMI BASE
// ============================================================================

export const IdSchema = z.string().min(1, 'ID obbligatorio')

export const NameSchema = z.string()
  .min(2, 'Nome deve essere di almeno 2 caratteri')
  .max(100, 'Nome non può superare 100 caratteri')
  .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Nome contiene caratteri non validi')

export const EmailSchema = z.string()
  .email('Email non valida')
  .optional()
  .or(z.literal(''))

export const PhoneSchema = z.string()
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Numero di telefono non valido')
  .optional()
  .or(z.literal(''))

export const TemperatureSchema = z.number()
  .min(-50, 'Temperatura troppo bassa (min -50°C)')
  .max(50, 'Temperatura troppo alta (max 50°C)')

export const DateSchema = z.string()
  .datetime('Data non valida')
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Formato data non valido'))

export const TimestampSchema = z.string()
  .datetime('Timestamp non valido')

// ============================================================================
// SCHEMI PER CATEGORIE
// ============================================================================

export const ProductCategorySchema = z.object({
  id: z.string().min(1, 'ID categoria obbligatorio'),
  name: z.string().min(2, 'Nome categoria obbligatorio'),
  tempRange: z.array(z.number()).length(2, 'Range temperatura deve avere 2 valori'),
  description: z.string().optional()
})

export const StorageCategorySchema = z.object({
  id: z.string().min(1, 'ID categoria obbligatorio'),
  name: z.string().min(2, 'Nome categoria obbligatorio'),
  temperatureMin: z.number().optional(),
  temperatureMax: z.number().optional(),
  isAmbiente: z.boolean().default(false)
})

// ============================================================================
// SCHEMI PER VALIDAZIONE HACCP
// ============================================================================

export const HACCPValidationResult = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
})

export const HACCPComplianceStatus = z.enum(['compliant', 'warning', 'critical', 'unknown'])

// ============================================================================
// UTILITY PER VALIDAZIONE
// ============================================================================

export const validateWithSchema = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors: string[]
} => {
  try {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: []
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Errore di validazione: ${error}`]
    }
  }
}

export const validatePartial = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: Partial<T>
  errors: string[]
} => {
  try {
    const result = schema.partial().safeParse(data)
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        errors: []
      }
    } else {
      return {
        success: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [`Errore di validazione parziale: ${error}`]
    }
  }
}

// ============================================================================
// SCHEMI PER FORM
// ============================================================================

export const FormStateSchema = z.object({
  mode: z.enum(['idle', 'create', 'edit']),
  editId: z.string().optional(),
  draft: z.record(z.any()),
  errors: z.record(z.string())
})

export const FormValidationResult = z.object({
  isValid: boolean,
  errors: z.record(z.string()),
  warnings: z.array(z.string())
})

// ============================================================================
// SCHEMI PER META
// ============================================================================

export const MetaSchema = z.object({
  schemaVersion: z.number().min(1),
  lastSync: z.string().datetime().nullable(),
  devMode: z.boolean(),
  forms: z.record(FormStateSchema),
  errors: z.array(z.object({
    id: z.string(),
    type: z.enum(['validation', 'network', 'system']),
    message: z.string(),
    timestamp: z.string().datetime(),
    resolved: z.boolean()
  })),
  ui: z.object({
    activeTab: z.string(),
    showOnboarding: z.boolean(),
    onboardingCompleted: z.boolean()
  })
})

// ============================================================================
// SCHEMI PER ONBOARDING
// ============================================================================

export const OnboardingBusinessInfoSchema = z.object({
  businessName: z.string().min(2, 'Nome azienda obbligatorio').optional(),
  businessType: z.string().min(2, 'Tipo attività obbligatorio').optional(),
  address: z.string().min(5, 'Indirizzo obbligatorio').optional(),
  phone: PhoneSchema,
  email: EmailSchema,
  vatNumber: z.string().regex(/^[A-Z]{2}[0-9]{11}$/, 'P.IVA non valida').optional()
})

export const OnboardingDepartmentSchema = z.object({
  id: z.string().min(1, 'ID reparto obbligatorio'),
  name: z.string().min(2, 'Nome reparto obbligatorio'),
  enabled: z.boolean()
})

export const OnboardingStaffSchema = z.object({
  id: z.string().min(1, 'ID staff obbligatorio'),
  fullName: z.string().min(2, 'Nome completo obbligatorio'),
  role: z.string().min(2, 'Ruolo obbligatorio'),
  department: z.string().min(2, 'Reparto obbligatorio'),
  email: EmailSchema,
  phone: PhoneSchema
})

export const OnboardingRefrigeratorSchema = z.object({
  id: z.string().min(1, 'ID frigorifero obbligatorio'),
  name: z.string().min(2, 'Nome frigorifero obbligatorio'),
  location: z.string().min(2, 'Posizione obbligatoria'),
  targetTemp: TemperatureSchema,
  selectedCategories: z.array(z.string()),
  isAbbattitore: z.boolean().default(false)
})

export const OnboardingSupplierSchema = z.object({
  id: z.string().min(1, 'ID fornitore obbligatorio'),
  name: z.string().min(2, 'Nome fornitore obbligatorio'),
  category: z.string().min(2, 'Categoria obbligatoria'),
  contact: z.string().min(2, 'Contatto obbligatorio'),
  documentation: z.string().min(2, 'Documentazione obbligatoria')
})

export const OnboardingDataSchema = z.object({
  businessInfo: OnboardingBusinessInfoSchema.optional(),
  departments: z.array(OnboardingDepartmentSchema).optional(),
  staff: z.array(OnboardingStaffSchema).optional(),
  refrigerators: z.array(OnboardingRefrigeratorSchema).optional(),
  suppliers: z.array(OnboardingSupplierSchema).optional()
})
