/**
 * Data Validation Utilities - Validazione dati per prevenire errori di parsing
 * 
 * Questo file contiene funzioni di validazione per tutti i dati dell'app
 * per prevenire errori di parsing e trascrizione
 * 
 * @version 1.0
 * @critical Sicurezza dati - Validazione e compliance
 */

import { debugLog, errorLog } from './debug';

// Schema di validazione per i dati di manutenzione
export const MAINTENANCE_DATA_SCHEMA = {
  id: 'string',
  company_id: 'string',
  conservation_point_id: 'string',
  conservation_point_name: 'string',
  task_type: 'string',
  frequency: 'string',
  selected_days: 'array',
  assigned_role: 'string',
  assigned_category: 'string',
  assigned_staff_ids: 'array',
  is_active: 'boolean',
  created_at: 'string',
  updated_at: 'string'
};

// Schema di validazione per i punti di conservazione
export const CONSERVATION_POINT_SCHEMA = {
  id: 'string',
  name: 'string',
  location: 'string',
  setTempMode: 'string',
  setTempC: 'number',
  setTempRangeC: 'object',
  dedicatedTo: 'string',
  selectedCategories: 'array',
  maintenanceData: 'object',
  isAbbattitore: 'boolean',
  createdAt: 'string',
  updatedAt: 'string'
};

// Schema di validazione per i dipendenti
export const STAFF_MEMBER_SCHEMA = {
  id: 'string',
  name: 'string',
  surname: 'string',
  role: 'string',
  categories: 'array',
  email: 'string',
  phone: 'string',
  isActive: 'boolean'
};

/**
 * Valida un singolo campo secondo il tipo atteso
 */
export const validateField = (value, expectedType, fieldName = 'campo') => {
  try {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, error: `${fieldName} deve essere una stringa` };
        }
        if (value.trim().length === 0) {
          return { isValid: false, error: `${fieldName} non può essere vuoto` };
        }
        break;
      
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { isValid: false, error: `${fieldName} deve essere un numero valido` };
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return { isValid: false, error: `${fieldName} deve essere true o false` };
        }
        break;
      
      case 'array':
        if (!Array.isArray(value)) {
          return { isValid: false, error: `${fieldName} deve essere un array` };
        }
        break;
      
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return { isValid: false, error: `${fieldName} deve essere un oggetto` };
        }
        break;
      
      default:
        return { isValid: false, error: `Tipo di dato non supportato: ${expectedType}` };
    }
    
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `Errore di validazione per ${fieldName}: ${error.message}` };
  }
};

/**
 * Valida un oggetto completo secondo uno schema
 */
export const validateObject = (obj, schema, objectName = 'oggetto') => {
  const errors = [];
  
  try {
    // Verifica che l'oggetto non sia null o undefined
    if (!obj || typeof obj !== 'object') {
      return { isValid: false, errors: [`${objectName} deve essere un oggetto valido`] };
    }
    
    // Verifica ogni campo dello schema
    for (const [fieldName, expectedType] of Object.entries(schema)) {
      const fieldValue = obj[fieldName];
      
      // Se il campo è undefined, lo considera come errore
      if (fieldValue === undefined) {
        errors.push(`Campo obbligatorio mancante: ${fieldName}`);
        continue;
      }
      
      // Valida il campo
      const validation = validateField(fieldValue, expectedType, fieldName);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }
    
    // Verifica che non ci siano campi extra non definiti nello schema
    for (const fieldName of Object.keys(obj)) {
      if (!schema.hasOwnProperty(fieldName)) {
        errors.push(`Campo non riconosciuto: ${fieldName}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Errore durante la validazione di ${objectName}: ${error.message}`]
    };
  }
};

/**
 * Valida i dati di manutenzione
 */
export const validateMaintenanceData = (maintenanceData) => {
  debugLog('🔍 Validazione dati manutenzione:', maintenanceData);
  
  const validation = validateObject(maintenanceData, MAINTENANCE_DATA_SCHEMA, 'dati manutenzione');
  
  if (!validation.isValid) {
    errorLog('❌ Validazione manutenzione fallita:', validation.errors);
  } else {
    debugLog('✅ Validazione manutenzione superata');
  }
  
  return validation;
};

/**
 * Valida un punto di conservazione
 */
export const validateConservationPointData = (conservationPoint) => {
  debugLog('🔍 Validazione punto conservazione:', conservationPoint);
  
  const validation = validateObject(conservationPoint, CONSERVATION_POINT_SCHEMA, 'punto conservazione');
  
  if (!validation.isValid) {
    errorLog('❌ Validazione punto conservazione fallita:', validation.errors);
  } else {
    debugLog('✅ Validazione punto conservazione superata');
  }
  
  return validation;
};

/**
 * Valida i dati di un dipendente
 */
export const validateStaffMemberData = (staffMember) => {
  debugLog('🔍 Validazione dipendente:', staffMember);
  
  const validation = validateObject(staffMember, STAFF_MEMBER_SCHEMA, 'dipendente');
  
  if (!validation.isValid) {
    errorLog('❌ Validazione dipendente fallita:', validation.errors);
  } else {
    debugLog('✅ Validazione dipendente superata');
  }
  
  return validation;
};

/**
 * Sanitizza una stringa per prevenire errori di parsing
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  
  // Rimuove caratteri potenzialmente pericolosi
  return str
    .replace(/[<>]/g, '') // Rimuove < e >
    .replace(/javascript:/gi, '') // Rimuove javascript:
    .replace(/on\w+=/gi, '') // Rimuove event handlers
    .trim();
};

/**
 * Sanitizza un array per prevenire errori di parsing
 */
export const sanitizeArray = (arr) => {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  return arr
    .filter(item => item !== null && item !== undefined)
    .map(item => typeof item === 'string' ? sanitizeString(item) : item);
};

/**
 * Sanitizza un oggetto completo
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Valida e sanitizza i dati prima del salvataggio
 */
export const validateAndSanitizeData = (data, schema, dataName = 'dati') => {
  try {
    // Prima sanitizza i dati
    const sanitizedData = sanitizeObject(data);
    
    // Poi valida i dati sanitizzati
    const validation = validateObject(sanitizedData, schema, dataName);
    
    if (!validation.isValid) {
      errorLog(`❌ Validazione ${dataName} fallita:`, validation.errors);
      return {
        isValid: false,
        errors: validation.errors,
        sanitizedData: null
      };
    }
    
    debugLog(`✅ Validazione e sanitizzazione ${dataName} completata`);
    return {
      isValid: true,
      errors: [],
      sanitizedData
    };
  } catch (error) {
    errorLog(`❌ Errore durante validazione/sanitizzazione ${dataName}:`, error);
    return {
      isValid: false,
      errors: [`Errore di validazione: ${error.message}`],
      sanitizedData: null
    };
  }
};

/**
 * Valida un array di oggetti
 */
export const validateArray = (arr, schema, itemName = 'elemento') => {
  if (!Array.isArray(arr)) {
    return {
      isValid: false,
      errors: [`I ${itemName} devono essere un array`]
    };
  }
  
  const errors = [];
  
  arr.forEach((item, index) => {
    const validation = validateObject(item, schema, `${itemName} ${index + 1}`);
    if (!validation.isValid) {
      errors.push(...validation.errors.map(error => `[${index + 1}] ${error}`));
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  validateField,
  validateObject,
  validateMaintenanceData,
  validateConservationPointData,
  validateStaffMemberData,
  sanitizeString,
  sanitizeArray,
  sanitizeObject,
  validateAndSanitizeData,
  validateArray,
  MAINTENANCE_DATA_SCHEMA,
  CONSERVATION_POINT_SCHEMA,
  STAFF_MEMBER_SCHEMA
};
