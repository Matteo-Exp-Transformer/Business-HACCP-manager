import { ConservationPointSchema, ConservationPointInputSchema, StaffSchema, DepartmentSchema } from "./schemas/entities";
import { CONSERVATION_POINT_RULES } from "../utils/haccpRules";

// Funzione per normalizzare input ConservationPoint
export function normalizeConservationPointInput(input: any) {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const normalized = {
    name: input.name?.trim() || '',
    type: input.type || (input.isAbbattitore ? 'ABBATTITORE' : 'FRIGO'),
    location: input.location?.trim() || '',
    categories: Array.isArray(input.categories) ? input.categories : 
                Array.isArray(input.selectedCategories) ? input.selectedCategories : [],
    targetTemp: input.targetTemp || input.tempRange?.[0] || 4,
    minTemp: input.minTemp || input.tempRange?.[0],
    maxTemp: input.maxTemp || input.tempRange?.[1],
    isAbbattitore: input.isAbbattitore || input.type === 'ABBATTITORE',
    meta: input.meta || {}
  };

  // Rimuovi duplicati dalle categorie
  normalized.categories = [...new Set(normalized.categories)];

  return normalized;
}

// Funzione per validare ConservationPoint con regole HACCP
export function validateConservationPoint(data: unknown, context?: { existing?: any[], rules?: any }) {
  const normalized = normalizeConservationPointInput(data);
  
  // Valida schema base
  const schemaResult = ConservationPointInputSchema.safeParse(normalized);
  if (!schemaResult.success) {
    return {
      success: false,
      error: new Error('Dati non validi'),
      errors: schemaResult.error.errors.map(e => e.message)
    };
  }

  const validated = schemaResult.data;
  const errors: string[] = [];

  // Validazione HACCP
  if (context?.rules) {
    const rules = context.rules;
    
    // Controlla duplicati nome/location
    if (context.existing) {
      const existing = context.existing as any[];
      const duplicate = existing.find(p => 
        p.location === validated.location && 
        p.name.toLowerCase() === validated.name.toLowerCase() &&
        p.id !== validated.id
      );
      if (duplicate) {
        errors.push('Esiste già un punto con lo stesso nome in questa sede');
      }
    }

    // Valida compatibilità temperature con categorie
    if (validated.categories.length > 0) {
      const tempRange = getTempRangeFromInput(validated);
      const compatibility = rules.validateTemperatureCompatibility?.(
        tempRange.min, 
        tempRange.max, 
        validated.categories
      );
      
      if (compatibility && !compatibility.compatible) {
        errors.push(compatibility.message);
      }
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: new Error('Validazione HACCP fallita'),
      errors
    };
  }

  // Converte in ConservationPoint completo
  const tempRange = getTempRangeFromInput(validated);
  const conservationPoint = {
    id: data.id || `pc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: validated.name,
    type: validated.type,
    location: validated.location,
    categories: validated.categories,
    tempRange: [tempRange.min, tempRange.max],
    lastReading: data.lastReading,
    status: computeConservationPointStatus(validated, data.lastReading, context?.rules),
    meta: validated.meta
  };

  return {
    success: true,
    data: conservationPoint
  };
}

// Helper per estrarre range temperatura dall'input
function getTempRangeFromInput(input: any) {
  if (input.minTemp !== undefined && input.maxTemp !== undefined) {
    return { min: input.minTemp, max: input.maxTemp };
  }
  
  if (input.tempRange && Array.isArray(input.tempRange) && input.tempRange.length === 2) {
    return { min: input.tempRange[0], max: input.tempRange[1] };
  }
  
  // Default basato sul tipo
  const targetTemp = input.targetTemp || 4;
  const tolerance = 2;
  
  return {
    min: targetTemp - tolerance,
    max: targetTemp + tolerance
  };
}

// Funzione per calcolare status ConservationPoint
export function computeConservationPointStatus(point: any, lastReading?: number, rules?: any) {
  if (typeof lastReading !== 'number') {
    return 'OK';
  }
  
  const tempRange = getTempRangeFromInput(point);
  const isInRange = lastReading >= tempRange.min && lastReading <= tempRange.max;
  
  if (isInRange) {
    return 'OK';
  }
  
  // Controlla se è in zona di attenzione (±1°C dal range)
  const tolerance = 1;
  const isInWarning = lastReading >= (tempRange.min - tolerance) && 
                     lastReading <= (tempRange.max + tolerance);
  
  return isInWarning ? 'ATTENZIONE' : 'FUORI_RANGE';
}

export function validateStaff(data: unknown) {
  return StaffSchema.safeParse(data);
}

export function validateDepartment(data: unknown) {
  return DepartmentSchema.safeParse(data);
}

// Validation service object for form validation
export const validationService = {
  validateForm: (entityType: string, data: unknown, mode: 'create' | 'update') => {
    switch (entityType) {
      case 'refrigerators':
      case 'conservationPoints':
        return validateConservationPoint(data);
      case 'staff':
        return validateStaff(data);
      case 'departments':
        return validateDepartment(data);
      default:
        return { success: false, error: new Error(`Unknown entity type: ${entityType}`) };
    }
  },
  
  // Nuove funzioni specifiche per ConservationPoint
  normalizeConservationPointInput,
  validateConservationPoint,
  computeConservationPointStatus
};