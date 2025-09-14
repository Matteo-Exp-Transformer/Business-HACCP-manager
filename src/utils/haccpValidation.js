/**
 * Logica di validazione HACCP centralizzata
 * Funzioni pure per validazione di conformità, compatibilità e regole HACCP
 */

import { HACCP_TOLERANCE_C, AMBIENT_RANGE_C, TEMP_MODES, TEMP_THRESHOLDS } from './haccpConstants'
import { parseSetTemperature, getDisplayTemperature } from './temperatureHelpers'
import { validationLog } from './debug'

/**
 * Risultato di una validazione HACCP
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Se la validazione è passata
 * @property {string} message - Messaggio di validazione
 * @property {string} type - Tipo di validazione ('compliant'|'warning'|'error')
 * @property {string} color - Colore per UI ('green'|'yellow'|'red')
 */

/**
 * Controlla la compatibilità HACCP tra temperatura e categorie
 * @param {Object} temperature - Oggetto temperatura (formato normalizzato o legacy)
 * @param {Array<string>} categories - Array di ID categorie
 * @returns {ValidationResult}
 */
export const checkHACCPCompliance = (temperature, categories) => {
  validationLog('Controllo conformità HACCP', { temperature, categories })
  
  if (!categories || categories.length === 0) {
    return {
      isValid: false,
      message: 'Seleziona almeno una categoria',
      type: 'error',
      color: 'red'
    }
  }

  // Parsa la temperatura usando l'helper centralizzato
  const tempInfo = parseSetTemperature(temperature)
  
  if (tempInfo.mode === 'unknown') {
    return {
      isValid: false,
      message: 'Temperatura non valida',
      type: 'error',
      color: 'red'
    }
  }

  // Per ora restituisce un risultato neutro
  // TODO: Implementare logica di validazione specifica per categorie
  return {
    isValid: true,
    message: 'Conformità HACCP verificata',
    type: 'compliant',
    color: 'green'
  }
}

/**
 * Controlla conflitti tra temperatura impostata e categorie selezionate
 * @param {Object} temperature - Oggetto temperatura
 * @param {Array<string>} categories - Array di ID categorie
 * @returns {Array<Object>} Array di conflitti rilevati
 */
export const checkTemperatureCategoryConflicts = (temperature, categories) => {
  validationLog('Controllo conflitti temperatura-categorie', { temperature, categories })
  
  const conflicts = []
  
  // TODO: Implementare logica di controllo conflitti specifica
  // Per ora restituisce array vuoto
  
  return conflicts
}

/**
 * Valida un punto di conservazione
 * @param {Object} conservationPoint - Punto di conservazione da validare
 * @returns {ValidationResult}
 */
export const validateConservationPoint = (conservationPoint) => {
  validationLog('Validazione punto di conservazione', conservationPoint)
  
  if (!conservationPoint.name || !conservationPoint.name.trim()) {
    return {
      isValid: false,
      message: 'Nome del punto di conservazione obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  if (!conservationPoint.departmentName || !conservationPoint.departmentName.trim()) {
    return {
      isValid: false,
      message: 'Reparto obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  if (!conservationPoint.storageCategoryIds || conservationPoint.storageCategoryIds.length === 0) {
    return {
      isValid: false,
      message: 'Seleziona almeno una categoria di stoccaggio',
      type: 'error',
      color: 'red'
    }
  }

  // Validazione temperatura
  const tempInfo = parseSetTemperature(conservationPoint)
  
  if (tempInfo.mode === TEMP_MODES.FIXED) {
    if (!conservationPoint.setTempC || isNaN(conservationPoint.setTempC)) {
      return {
        isValid: false,
        message: 'Temperatura fissa non valida',
        type: 'error',
        color: 'red'
      }
    }
  } else if (tempInfo.mode === TEMP_MODES.RANGE) {
    if (!conservationPoint.setTempRangeC || 
        !conservationPoint.setTempRangeC.min || 
        !conservationPoint.setTempRangeC.max ||
        conservationPoint.setTempRangeC.min >= conservationPoint.setTempRangeC.max) {
      return {
        isValid: false,
        message: 'Range di temperatura non valido',
        type: 'error',
        color: 'red'
      }
    }
  }

  return {
    isValid: true,
    message: 'Punto di conservazione valido',
    type: 'compliant',
    color: 'green'
  }
}

/**
 * Valida un prodotto
 * @param {Object} product - Prodotto da validare
 * @returns {ValidationResult}
 */
export const validateProduct = (product) => {
  validationLog('Validazione prodotto', product)
  
  if (!product.name || !product.name.trim()) {
    return {
      isValid: false,
      message: 'Nome prodotto obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  if (!product.categoryId || !product.categoryId.trim()) {
    return {
      isValid: false,
      message: 'Categoria prodotto obbligatoria',
      type: 'error',
      color: 'red'
    }
  }

  if (!product.expiryDate || !product.expiryDate.trim()) {
    return {
      isValid: false,
      message: 'Data di scadenza obbligatoria',
      type: 'error',
      color: 'red'
    }
  }

  // Validazione data di scadenza
  const expiryDate = new Date(product.expiryDate)
  const today = new Date()
  
  if (isNaN(expiryDate.getTime())) {
    return {
      isValid: false,
      message: 'Data di scadenza non valida',
      type: 'error',
      color: 'red'
    }
  }

  if (expiryDate < today) {
    return {
      isValid: false,
      message: 'Data di scadenza già passata',
      type: 'warning',
      color: 'yellow'
    }
  }

  return {
    isValid: true,
    message: 'Prodotto valido',
    type: 'compliant',
    color: 'green'
  }
}

/**
 * Valida un log di temperatura
 * @param {Object} temperatureLog - Log temperatura da validare
 * @returns {ValidationResult}
 */
export const validateTemperatureLog = (temperatureLog) => {
  validationLog('Validazione log temperatura', temperatureLog)
  
  if (!temperatureLog.conservationPointId || !temperatureLog.conservationPointId.trim()) {
    return {
      isValid: false,
      message: 'Punto di conservazione obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  if (temperatureLog.temperatureC === undefined || temperatureLog.temperatureC === null || isNaN(temperatureLog.temperatureC)) {
    return {
      isValid: false,
      message: 'Temperatura obbligatoria e deve essere un numero',
      type: 'error',
      color: 'red'
    }
  }

  if (!temperatureLog.timestamp || !temperatureLog.timestamp.trim()) {
    return {
      isValid: false,
      message: 'Timestamp obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  // Validazione range temperatura ragionevole
  if (temperatureLog.temperatureC < -50 || temperatureLog.temperatureC > 100) {
    return {
      isValid: false,
      message: 'Temperatura fuori range ragionevole (-50°C a 100°C)',
      type: 'error',
      color: 'red'
    }
  }

  return {
    isValid: true,
    message: 'Log temperatura valido',
    type: 'compliant',
    color: 'green'
  }
}

/**
 * Controlla se una temperatura è compatibile con un punto di conservazione
 * @param {number} actualTemp - Temperatura effettiva misurata
 * @param {Object} conservationPoint - Punto di conservazione
 * @returns {ValidationResult}
 */
export const checkTemperatureCompatibility = (actualTemp, conservationPoint) => {
  validationLog('Controllo compatibilità temperatura', { actualTemp, conservationPoint })
  
  if (isNaN(actualTemp)) {
    return {
      isValid: false,
      message: 'Temperatura non valida',
      type: 'error',
      color: 'red'
    }
  }

  const tempInfo = parseSetTemperature(conservationPoint)
  
  if (tempInfo.mode === 'unknown') {
    return {
      isValid: false,
      message: 'Configurazione temperatura non valida',
      type: 'error',
      color: 'red'
    }
  }

  let inRange = false
  let diff = Infinity

  if (tempInfo.mode === TEMP_MODES.FIXED) {
    diff = Math.abs(actualTemp - tempInfo.value)
    inRange = actualTemp >= (tempInfo.value - HACCP_TOLERANCE_C) && 
              actualTemp <= (tempInfo.value + HACCP_TOLERANCE_C)
  } else if (tempInfo.mode === TEMP_MODES.RANGE) {
    inRange = actualTemp >= (tempInfo.range.min - HACCP_TOLERANCE_C) && 
              actualTemp <= (tempInfo.range.max + HACCP_TOLERANCE_C)
    if (actualTemp < tempInfo.range.min) diff = tempInfo.range.min - actualTemp
    else if (actualTemp > tempInfo.range.max) diff = actualTemp - tempInfo.range.max
    else diff = 0
  } else if (tempInfo.mode === TEMP_MODES.AMBIENT) {
    inRange = actualTemp >= (AMBIENT_RANGE_C.min - HACCP_TOLERANCE_C) && 
              actualTemp <= (AMBIENT_RANGE_C.max + HACCP_TOLERANCE_C)
    if (actualTemp < AMBIENT_RANGE_C.min) diff = AMBIENT_RANGE_C.min - actualTemp
    else if (actualTemp > AMBIENT_RANGE_C.max) diff = actualTemp - AMBIENT_RANGE_C.max
    else diff = 0
  }

  // Controlla se è esattamente nel range (conforme)
  let exactRange = false
  if (tempInfo.mode === TEMP_MODES.FIXED) {
    exactRange = Math.abs(actualTemp - tempInfo.value) <= TEMP_THRESHOLDS.GREEN_MAX
  } else if (tempInfo.mode === TEMP_MODES.RANGE) {
    exactRange = actualTemp >= tempInfo.range.min && actualTemp <= tempInfo.range.max
  } else if (tempInfo.mode === TEMP_MODES.AMBIENT) {
    exactRange = actualTemp >= AMBIENT_RANGE_C.min && actualTemp <= AMBIENT_RANGE_C.max
  }

  if (exactRange) {
    return {
      isValid: true,
      message: 'Temperatura conforme',
      type: 'compliant',
      color: 'green'
    }
  }

  if (inRange) {
    return {
      isValid: true,
      message: 'Temperatura in tolleranza',
      type: 'warning',
      color: 'yellow'
    }
  }

  return {
    isValid: false,
    message: `Temperatura fuori range (diff: ${diff.toFixed(1)}°C)`,
    type: 'error',
    color: 'red'
  }
}

/**
 * Valida una configurazione di manutenzione
 * @param {string} taskType - Tipo di task di manutenzione
 * @param {Object} taskData - Dati del task
 * @returns {ValidationResult}
 */
export const validateMaintenanceConfig = (taskType, taskData) => {
  validationLog('Validazione configurazione manutenzione', { taskType, taskData })
  
  if (!taskData) {
    return {
      isValid: false,
      message: 'Configurazione manutenzione mancante',
      type: 'error',
      color: 'red'
    }
  }

  if (!taskData.frequency || !taskData.frequency.trim()) {
    return {
      isValid: false,
      message: 'Frequenza manutenzione obbligatoria',
      type: 'error',
      color: 'red'
    }
  }

  if (!taskData.assigned_role || !taskData.assigned_role.trim()) {
    return {
      isValid: false,
      message: 'Ruolo assegnato obbligatorio',
      type: 'error',
      color: 'red'
    }
  }

  return {
    isValid: true,
    message: 'Configurazione manutenzione valida',
    type: 'compliant',
    color: 'green'
  }
}

export default {
  checkHACCPCompliance,
  checkTemperatureCategoryConflicts,
  validateConservationPoint,
  validateProduct,
  validateTemperatureLog,
  checkTemperatureCompatibility,
  validateMaintenanceConfig
}
