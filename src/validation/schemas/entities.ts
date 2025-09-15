import { z } from "zod";
import { IdSchema, RangeSchema } from "./base";

// Schema per ConservationPoint completo con validazione HACCP
export const ConservationPointSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, { message: "validation.required_name" }),
  type: z.enum(['FRIGO', 'FREEZER', 'ABBATTITORE', 'AMBIENTE'], { 
    message: "validation.invalid_type" 
  }),
  location: z.string().min(1, { message: "validation.required_location" }),
  categories: z.array(z.string()).default([]),
  tempRange: z.tuple([z.number(), z.number()]).refine(
    ([min, max]) => min < max, 
    { message: "validation.invalid_temp_range" }
  ),
  lastReading: z.number().optional(),
  status: z.enum(['OK', 'ATTENZIONE', 'FUORI_RANGE']).default('OK'),
  meta: z.record(z.any()).optional(),
  // Campi legacy per compatibilità
  label: z.string().optional(),
  range: RangeSchema.optional(),
  alarm: z.object({
    enabled: z.boolean(),
    threshold: z.number().optional()
  }).optional()
});

// Schema per validazione input utente (più permissivo)
export const ConservationPointInputSchema = z.object({
  name: z.string().min(1, { message: "validation.required_name" }),
  type: z.enum(['FRIGO', 'FREEZER', 'ABBATTITORE', 'AMBIENTE']),
  location: z.string().min(1, { message: "validation.required_location" }),
  categories: z.array(z.string()).default([]),
  targetTemp: z.number().optional(), // Per compatibilità con UI esistente
  minTemp: z.number().optional(),    // Per compatibilità
  maxTemp: z.number().optional(),    // Per compatibilità
  isAbbattitore: z.boolean().optional(),
  selectedCategories: z.array(z.string()).optional() // Per compatibilità UI
});

export const StaffSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, { message: "validation.required_name" }),
  departmentId: IdSchema.optional()
});

export const DepartmentSchema = z.object({
  id: IdSchema,
  name: z.string().min(1, { message: "validation.required_name" })
});
