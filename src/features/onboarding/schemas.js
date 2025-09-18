/**
 * Onboarding Validation Schemas - HACCP Business Manager
 * 
 * Zod schemas for validating onboarding form data with HACCP compliance
 */

import { z } from 'zod'

// Business information schema
export const businessInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(100, 'Il nome non può superare 100 caratteri'),
  
  address: z
    .string()
    .min(10, 'Inserisci un indirizzo completo')
    .max(200, 'L\'indirizzo è troppo lungo'),
  
  email: z
    .string()
    .email('Inserisci un indirizzo email valido')
    .min(5, 'Email troppo corta')
    .max(100, 'Email troppo lunga'),
  
  phone: z
    .string()
    .regex(/^[+]?[0-9\s\-\(\)]{8,20}$/, 'Inserisci un numero di telefono valido')
    .optional()
    .or(z.literal('')),
  
  vatNumber: z
    .string()
    .regex(/^[A-Z]{2}[0-9]{11}$/, 'Partita IVA non valida (formato: IT12345678901)')
    .optional()
    .or(z.literal('')),
  
  employeeCount: z
    .number()
    .int('Il numero deve essere intero')
    .min(1, 'Deve esserci almeno 1 dipendente')
    .max(1000, 'Numero troppo elevato'),
  
  businessType: z
    .enum(['restaurant', 'pizzeria', 'bar', 'catering', 'bakery', 'other'])
    .default('restaurant')
})

// Department schema
export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome del reparto deve essere di almeno 2 caratteri')
    .max(50, 'Il nome del reparto è troppo lungo'),
  
  description: z
    .string()
    .max(200, 'La descrizione è troppo lunga')
    .optional()
    .or(z.literal('')),
  
  isActive: z.boolean().default(true),
  isCustom: z.boolean().default(false)
})

// Departments collection schema
export const departmentsSchema = z.object({
  departments: z
    .array(departmentSchema)
    .min(1, 'Deve essere configurato almeno 1 reparto')
    .max(20, 'Troppi reparti configurati')
    .refine(
      (departments) => {
        const names = departments.map(d => d.name.toLowerCase())
        return new Set(names).size === names.length
      },
      'I nomi dei reparti devono essere univoci'
    )
})

// Staff member schema
export const staffMemberSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(50, 'Il nome è troppo lungo'),
  
  lastName: z
    .string()
    .min(2, 'Il cognome deve essere di almeno 2 caratteri')
    .max(50, 'Il cognome è troppo lungo'),
  
  email: z
    .string()
    .email('Inserisci un indirizzo email valido')
    .optional()
    .or(z.literal('')),
  
  role: z
    .enum(['admin', 'manager', 'employee', 'collaborator'])
    .default('employee'),
  
  departmentId: z
    .string()
    .uuid('ID reparto non valido'),
  
  haccpCertification: z.object({
    hasValidCertification: z.boolean().default(false),
    expiryDate: z
      .string()
      .optional()
      .refine(
        (date) => !date || new Date(date) > new Date(),
        'La certificazione è scaduta'
      ),
    certificationBody: z.string().optional()
  }).optional(),
  
  isActive: z.boolean().default(true)
})

// Staff collection schema
export const staffSchema = z.object({
  staff: z
    .array(staffMemberSchema)
    .min(1, 'Deve essere configurato almeno 1 membro dello staff')
    .max(100, 'Troppi membri dello staff')
    .refine(
      (staff) => {
        const emails = staff
          .map(s => s.email?.toLowerCase())
          .filter(email => email && email.length > 0)
        return new Set(emails).size === emails.length
      },
      'Gli indirizzi email devono essere univoci'
    )
})

// Conservation point schema
export const conservationPointSchema = z.object({
  name: z
    .string()
    .min(2, 'Il nome deve essere di almeno 2 caratteri')
    .max(100, 'Il nome è troppo lungo'),
  
  type: z
    .enum(['ambiente', 'frigorifero', 'freezer', 'abbattitore'])
    .default('frigorifero'),
  
  departmentId: z
    .string()
    .uuid('ID reparto non valido'),
  
  targetTemperatureMin: z
    .number()
    .min(-100, 'Temperatura minima troppo bassa')
    .max(50, 'Temperatura minima troppo alta'),
  
  targetTemperatureMax: z
    .number()
    .min(-100, 'Temperatura massima troppo bassa')
    .max(50, 'Temperatura massima troppo alta'),
  
  productCategories: z
    .array(z.string())
    .min(1, 'Seleziona almeno una categoria di prodotti')
    .max(20, 'Troppe categorie selezionate'),
  
  location: z
    .string()
    .max(100, 'La posizione è troppo lunga')
    .optional()
    .or(z.literal('')),
  
  isActive: z.boolean().default(true)
}).refine(
  (data) => data.targetTemperatureMin <= data.targetTemperatureMax,
  {
    message: 'La temperatura minima deve essere inferiore o uguale alla massima',
    path: ['targetTemperatureMax']
  }
)

// Conservation points collection schema
export const conservationPointsSchema = z.object({
  conservationPoints: z
    .array(conservationPointSchema)
    .min(1, 'Deve essere configurato almeno 1 punto di conservazione')
    .max(50, 'Troppi punti di conservazione')
    .refine(
      (points) => {
        const names = points.map(p => p.name.toLowerCase())
        return new Set(names).size === names.length
      },
      'I nomi dei punti di conservazione devono essere univoci'
    )
})

// Task schema
export const taskSchema = z.object({
  name: z
    .string()
    .min(3, 'Il nome della mansione deve essere di almeno 3 caratteri')
    .max(100, 'Il nome della mansione è troppo lungo'),
  
  description: z
    .string()
    .max(500, 'La descrizione è troppo lunga')
    .optional()
    .or(z.literal('')),
  
  type: z
    .enum(['maintenance', 'cleaning', 'general', 'temperature'])
    .default('general'),
  
  frequency: z
    .enum(['daily', 'weekly', 'monthly', 'yearly', 'custom'])
    .default('daily'),
  
  priority: z
    .enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
  
  assignedToRole: z
    .enum(['admin', 'manager', 'employee', 'collaborator'])
    .optional(),
  
  assignedToDepartmentId: z
    .string()
    .uuid('ID reparto non valido')
    .optional(),
  
  conservationPointId: z
    .string()
    .uuid('ID punto di conservazione non valido')
    .optional(),
  
  isActive: z.boolean().default(true)
})

// Tasks collection schema
export const tasksSchema = z.object({
  tasks: z
    .array(taskSchema)
    .min(1, 'Deve essere configurata almeno 1 mansione')
    .max(100, 'Troppe mansioni configurate')
})

// Complete onboarding schema
export const onboardingSchema = z.object({
  // Step 1: Business information
  business: businessInfoSchema,
  
  // Step 2: Departments
  departments: departmentsSchema,
  
  // Step 3: Staff
  staff: staffSchema,
  
  // Step 4: Conservation points
  conservationPoints: conservationPointsSchema,
  
  // Step 5: Basic tasks
  tasks: tasksSchema,
  
  // Metadata
  completedAt: z.string().datetime().optional(),
  version: z.string().default('1.0')
})

// HACCP compliance validation
export const haccpComplianceSchema = {
  // Validate temperature ranges for conservation point types
  validateTemperatureRange: (type, min, max) => {
    const ranges = {
      ambiente: { min: 15, max: 25 },
      frigorifero: { min: 0, max: 9 },
      freezer: { min: -25, max: -15 },
      abbattitore: { min: -50, max: -10 }
    }
    
    const validRange = ranges[type]
    if (!validRange) return { valid: false, message: 'Tipo non riconosciuto' }
    
    if (min < validRange.min || max > validRange.max) {
      return {
        valid: false,
        message: `Range temperatura per ${type}: ${validRange.min}°C - ${validRange.max}°C`
      }
    }
    
    return { valid: true }
  },

  // Validate minimum requirements
  validateMinimumRequirements: (data) => {
    const errors = []
    
    if (!data.departments?.departments?.length) {
      errors.push('Almeno 1 reparto richiesto')
    }
    
    if (!data.staff?.staff?.length) {
      errors.push('Almeno 1 membro dello staff richiesto')
    }
    
    if (!data.conservationPoints?.conservationPoints?.length) {
      errors.push('Almeno 1 punto di conservazione richiesto')
    }
    
    if (!data.tasks?.tasks?.length) {
      errors.push('Almeno 1 mansione richiesta')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Form step validation
export const stepValidationSchemas = {
  1: businessInfoSchema,
  2: departmentsSchema,
  3: staffSchema,
  4: conservationPointsSchema,
  5: tasksSchema
}

export default {
  businessInfoSchema,
  departmentSchema,
  departmentsSchema,
  staffMemberSchema,
  staffSchema,
  conservationPointSchema,
  conservationPointsSchema,
  taskSchema,
  tasksSchema,
  onboardingSchema,
  haccpComplianceSchema,
  stepValidationSchemas
}