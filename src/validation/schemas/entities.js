/**
 * Schemi di Validazione per Entities - Foundation Pack v1
 * 
 * Schemi Zod per validazione delle entities
 * Wrapper delle regole HACCP esistenti
 * 
 * @version 1.0
 * @critical Architettura - Validazione entities
 */

import { z } from 'zod'
import { 
  IdSchema, 
  NameSchema, 
  EmailSchema, 
  PhoneSchema, 
  TemperatureSchema, 
  TimestampSchema,
  validateWithSchema 
} from './base'

// ============================================================================
// SCHEMI PER REFRIGERATORS
// ============================================================================

export const RefrigeratorSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  location: z.string().min(2, 'Posizione obbligatoria'),
  targetTemp: TemperatureSchema,
  selectedCategories: z.array(z.string()),
  isAbbattitore: z.boolean().default(false),
  createdAt: TimestampSchema,
  updatedAt: TimestampSchema
})

export const RefrigeratorCreateSchema = RefrigeratorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
})

export const RefrigeratorUpdateSchema = RefrigeratorCreateSchema.partial()

// ============================================================================
// SCHEMI PER TEMPERATURES
// ============================================================================

export const TemperatureStatusSchema = z.enum(['ok', 'warning', 'danger'])

export const TemperatureSchema = z.object({
  id: IdSchema,
  refrigeratorId: IdSchema,
  temperature: TemperatureSchema,
  status: TemperatureStatusSchema,
  timestamp: TimestampSchema,
  operator: z.string().min(1, 'Operatore obbligatorio')
})

export const TemperatureCreateSchema = TemperatureSchema.omit({
  id: true,
  timestamp: true
})

export const TemperatureUpdateSchema = TemperatureCreateSchema.partial()

// ============================================================================
// SCHEMI PER CLEANING
// ============================================================================

export const CleaningFrequencySchema = z.enum([
  'daily',
  'weekly', 
  'monthly',
  'quarterly',
  'annually',
  'custom'
])

export const CleaningSchema = z.object({
  id: IdSchema,
  area: z.string().min(2, 'Area obbligatoria'),
  frequency: CleaningFrequencySchema,
  product: z.string().min(2, 'Prodotto obbligatorio'),
  operator: z.string().min(1, 'Operatore obbligatorio'),
  completed: z.boolean(),
  timestamp: TimestampSchema,
  department: z.string().min(2, 'Reparto obbligatorio')
})

export const CleaningCreateSchema = CleaningSchema.omit({
  id: true,
  timestamp: true
})

export const CleaningUpdateSchema = CleaningCreateSchema.partial()

// ============================================================================
// SCHEMI PER STAFF
// ============================================================================

export const StaffRoleSchema = z.enum([
  'Amministratore',
  'Responsabile',
  'Dipendente',
  'Collaboratore Occasionale'
])

export const StaffSchema = z.object({
  id: IdSchema,
  fullName: NameSchema,
  role: StaffRoleSchema,
  department: z.string().min(2, 'Reparto obbligatorio'),
  email: EmailSchema,
  phone: PhoneSchema,
  haccpTraining: z.boolean(),
  createdAt: TimestampSchema
})

export const StaffCreateSchema = StaffSchema.omit({
  id: true,
  createdAt: true
})

export const StaffUpdateSchema = StaffCreateSchema.partial()

// ============================================================================
// SCHEMI PER INVENTORY
// ============================================================================

export const InventoryStatusSchema = z.enum(['fresh', 'expiring', 'expired'])

export const InventoryUnitSchema = z.enum([
  'pz', 'kg', 'g', 'l', 'ml', 'scatola', 'confezione'
])

export const InventorySchema = z.object({
  id: IdSchema,
  name: NameSchema,
  category: z.string().min(2, 'Categoria obbligatoria'),
  supplier: z.string().min(2, 'Fornitore obbligatorio'),
  receivedDate: TimestampSchema,
  expiryDate: TimestampSchema,
  quantity: z.number().min(0, 'Quantità non può essere negativa'),
  unit: InventoryUnitSchema,
  location: z.string().min(2, 'Posizione obbligatoria'),
  status: InventoryStatusSchema
})

export const InventoryCreateSchema = InventorySchema.omit({
  id: true
})

export const InventoryUpdateSchema = InventoryCreateSchema.partial()

// ============================================================================
// SCHEMI PER DEPARTMENTS
// ============================================================================

export const DepartmentSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  enabled: z.boolean(),
  createdAt: TimestampSchema
})

export const DepartmentCreateSchema = DepartmentSchema.omit({
  id: true,
  createdAt: true
})

export const DepartmentUpdateSchema = DepartmentCreateSchema.partial()

// ============================================================================
// SCHEMI PER SUPPLIERS
// ============================================================================

export const SupplierSchema = z.object({
  id: IdSchema,
  name: NameSchema,
  category: z.string().min(2, 'Categoria obbligatoria'),
  contact: z.string().min(2, 'Contatto obbligatorio'),
  documentation: z.string().min(2, 'Documentazione obbligatoria'),
  createdAt: TimestampSchema
})

export const SupplierCreateSchema = SupplierSchema.omit({
  id: true,
  createdAt: true
})

export const SupplierUpdateSchema = SupplierCreateSchema.partial()

// ============================================================================
// SCHEMI PER VALIDAZIONE HACCP
// ============================================================================

export const HACCPValidationSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string())
})

export const HACCPComplianceCheckSchema = z.object({
  refrigeratorId: IdSchema,
  temperature: TemperatureSchema,
  targetTemp: TemperatureSchema,
  tolerance: z.number().min(0).max(10),
  status: z.enum(['compliant', 'warning', 'critical', 'unknown'])
})

// ============================================================================
// FUNZIONI DI VALIDAZIONE
// ============================================================================

export const validateRefrigerator = (data: unknown) => 
  validateWithSchema(RefrigeratorSchema, data)

export const validateRefrigeratorCreate = (data: unknown) => 
  validateWithSchema(RefrigeratorCreateSchema, data)

export const validateRefrigeratorUpdate = (data: unknown) => 
  validateWithSchema(RefrigeratorUpdateSchema, data)

export const validateTemperature = (data: unknown) => 
  validateWithSchema(TemperatureSchema, data)

export const validateTemperatureCreate = (data: unknown) => 
  validateWithSchema(TemperatureCreateSchema, data)

export const validateCleaning = (data: unknown) => 
  validateWithSchema(CleaningSchema, data)

export const validateCleaningCreate = (data: unknown) => 
  validateWithSchema(CleaningCreateSchema, data)

export const validateStaff = (data: unknown) => 
  validateWithSchema(StaffSchema, data)

export const validateStaffCreate = (data: unknown) => 
  validateWithSchema(StaffCreateSchema, data)

export const validateInventory = (data: unknown) => 
  validateWithSchema(InventorySchema, data)

export const validateInventoryCreate = (data: unknown) => 
  validateWithSchema(InventoryCreateSchema, data)

export const validateDepartment = (data: unknown) => 
  validateWithSchema(DepartmentSchema, data)

export const validateDepartmentCreate = (data: unknown) => 
  validateWithSchema(DepartmentCreateSchema, data)

export const validateSupplier = (data: unknown) => 
  validateWithSchema(SupplierSchema, data)

export const validateSupplierCreate = (data: unknown) => 
  validateWithSchema(SupplierCreateSchema, data)

// ============================================================================
// VALIDAZIONI HACCP SPECIFICHE
// ============================================================================

export const validateHACCPCompliance = (data: unknown) => 
  validateWithSchema(HACCPComplianceCheckSchema, data)

export const validateTemperatureRange = (temp: number, min: number, max: number): boolean => {
  return temp >= min && temp <= max
}

export const validateTemperatureTolerance = (current: number, target: number, tolerance: number): boolean => {
  return Math.abs(current - target) <= tolerance
}

export const validateExpiryDate = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate)
  const now = new Date()
  return expiry > now
}

export const validateExpiryWarning = (expiryDate: string, days: number = 3): boolean => {
  const expiry = new Date(expiryDate)
  const warningDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return expiry <= warningDate
}
