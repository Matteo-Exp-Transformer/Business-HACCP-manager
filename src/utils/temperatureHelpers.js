/**
 * Helper per il parsing e la gestione delle temperature
 * Centralizza la logica per l'interpretazione delle temperature dei punti di conservazione
 */

import { TEMP_MODES, AMBIENT_RANGE_C, HACCP_TOLERANCE_C, TEMP_THRESHOLDS } from './haccpConstants'

/**
 * Parsa la temperatura impostata di un punto di conservazione
 * Gestisce i diversi formati legacy e restituisce un oggetto normalizzato
 * 
 * @param {Object} point - Punto di conservazione
 * @returns {Object} - { mode: 'fixed'|'range'|'ambient', value?: number, range?: {min, max} }
 */
export const parseSetTemperature = (point) => {
  // Prima controlla se è già nel formato normalizzato
  if (point.setTempMode) {
    if (point.setTempMode === TEMP_MODES.FIXED) {
      return { 
        mode: TEMP_MODES.FIXED, 
        value: point.setTempC 
      }
    } else if (point.setTempMode === TEMP_MODES.RANGE) {
      return { 
        mode: TEMP_MODES.RANGE, 
        range: point.setTempRangeC 
      }
    } else if (point.setTempMode === TEMP_MODES.AMBIENT) {
      return { mode: TEMP_MODES.AMBIENT }
    } else {
      // Modalità non riconosciuta
      return { mode: 'unknown' }
    }
  }
  
  // Fallback per formati legacy: targetTemp, setTemperature, temperature, temp
  const tempValue = point.targetTemp || point.setTemperature || point.temperature || point.temp
  
  if (!tempValue) {
    // Se ha campi sconosciuti (non temperature), considera come unknown
    if (point.unknownField) {
      return { mode: 'unknown' }
    }
    return { mode: TEMP_MODES.AMBIENT }
  }
  
  // Se è già un numero, è una temperatura fissa
  if (typeof tempValue === 'number') {
    return { 
      mode: TEMP_MODES.FIXED, 
      value: tempValue 
    }
  }
  
  // Se è una stringa, prova a parsarla
  if (typeof tempValue === 'string') {
    const str = tempValue.toLowerCase().trim()
    
    // Controlla se è "ambiente" o "ambient"
    if (str.includes('ambiente') || str.includes('ambient')) {
      return { mode: TEMP_MODES.AMBIENT }
    }
    
    // Controlla se contiene un range (es. "2-4°C", "da 2 a 4°C")
    const rangeMatch = str.match(/(\d+(?:\.\d+)?)\s*[-a]\s*(\d+(?:\.\d+)?)/)
    if (rangeMatch) {
      const min = parseFloat(rangeMatch[1])
      const max = parseFloat(rangeMatch[2])
      return { 
        mode: TEMP_MODES.RANGE, 
        range: { min, max } 
      }
    }
    
    // Controlla se è una temperatura singola (es. "4°C", "4")
    const singleMatch = str.match(/(\d+(?:\.\d+)?)/)
    if (singleMatch) {
      const value = parseFloat(singleMatch[1])
      return { 
        mode: TEMP_MODES.FIXED, 
        value 
      }
    }
  }
  
  // Default: ambiente
  return { mode: TEMP_MODES.AMBIENT }
}

/**
 * Determina il tipo di frigorifero basato sulla temperatura
 * @param {Object} point - Punto di conservazione
 * @returns {string} - Tipo di frigorifero
 */
export const getRefrigeratorType = (point) => {
  const { mode, value, range } = parseSetTemperature(point)
  
  if (mode === TEMP_MODES.AMBIENT) {
    return 'Ambiente'
  }
  
  if (mode === TEMP_MODES.FIXED) {
    if (value <= 0) return 'Freezer'
    if (value <= 4) return 'Frigorifero'
    if (value <= 8) return 'Frigorifero (zona calda)'
    return 'Ambiente controllato'
  }
  
  if (mode === TEMP_MODES.RANGE) {
    const avgTemp = (range.min + range.max) / 2
    if (avgTemp <= 0) return 'Freezer'
    if (avgTemp <= 4) return 'Frigorifero'
    if (avgTemp <= 8) return 'Frigorifero (zona calda)'
    return 'Ambiente controllato'
  }
  
  // Handle invalid or unknown modes
  if (mode === 'unknown') {
    return 'Sconosciuto'
  }
  
  return 'Sconosciuto'
}

/**
 * Calcola lo status della temperatura per la colorazione UI
 * @param {number} actualTemp - Temperatura misurata
 * @param {Object} point - Punto di conservazione
 * @returns {Object} - { status: 'green'|'orange'|'red', difference: number }
 */
export const getTemperatureStatus = (actualTemp, point) => {
  const { mode, value, range } = parseSetTemperature(point)
  
  let targetTemp
  if (mode === TEMP_MODES.FIXED) {
    targetTemp = value
  } else if (mode === TEMP_MODES.RANGE) {
    targetTemp = (range.min + range.max) / 2
  } else {
    // Per ambiente, usa la temperatura media del range ambiente
    targetTemp = (AMBIENT_RANGE_C.min + AMBIENT_RANGE_C.max) / 2
  }
  
  const difference = Math.abs(actualTemp - targetTemp)
  
  if (difference <= TEMP_THRESHOLDS.GREEN_MAX) {
    return { status: 'green', difference }
  } else if (difference < TEMP_THRESHOLDS.RED_MIN) {
    return { status: 'orange', difference }
  } else {
    return { status: 'red', difference }
  }
}

/**
 * Formatta la temperatura per la visualizzazione
 * @param {Object} point - Punto di conservazione
 * @returns {string} - Temperatura formattata per UI
 */
export const getDisplayTemperature = (point) => {
  const { mode, value, range } = parseSetTemperature(point)
  
  if (mode === TEMP_MODES.AMBIENT) {
    return 'Ambiente'
  }
  
  if (mode === TEMP_MODES.FIXED) {
    return `${value}°C`
  }
  
  if (mode === TEMP_MODES.RANGE) {
    return `${range.min}°C - ${range.max}°C`
  }
  
  // Handle invalid or unknown modes
  if (mode === 'unknown') {
    return 'N/A'
  }
  
  return 'N/A'
}

/**
 * Verifica se una temperatura è compatibile con un punto di conservazione
 * @param {number} temp - Temperatura da verificare
 * @param {Object} point - Punto di conservazione
 * @returns {Object} - { compatible: boolean, status: 'compatible'|'tolerance'|'incompatible' }
 */
export const isTemperatureCompatible = (temp, point) => {
  const { mode, value, range } = parseSetTemperature(point)
  
  if (mode === TEMP_MODES.AMBIENT) {
    const isInRange = temp >= AMBIENT_RANGE_C.min && temp <= AMBIENT_RANGE_C.max
    return {
      compatible: isInRange,
      status: isInRange ? 'compatible' : 'incompatible'
    }
  }
  
  if (mode === TEMP_MODES.FIXED) {
    const difference = Math.abs(temp - value)
    if (difference <= TEMP_THRESHOLDS.GREEN_MAX) {
      return { compatible: true, status: 'compatible' }
    } else if (difference <= HACCP_TOLERANCE_C) {
      return { compatible: true, status: 'tolerance' }
    } else {
      return { compatible: false, status: 'incompatible' }
    }
  }
  
  if (mode === TEMP_MODES.RANGE) {
    const isInRange = temp >= range.min && temp <= range.max
    if (isInRange) {
      return { compatible: true, status: 'compatible' }
    }
    
    // Controlla se è in tolleranza
    const minDiff = Math.abs(temp - range.min)
    const maxDiff = Math.abs(temp - range.max)
    const minDiffToRange = Math.min(minDiff, maxDiff)
    
    if (minDiffToRange <= HACCP_TOLERANCE_C) {
      return { compatible: true, status: 'tolerance' }
    } else {
      return { compatible: false, status: 'incompatible' }
    }
  }
  
  // Handle unknown mode
  if (mode === 'unknown') {
    return { compatible: false, status: 'incompatible' }
  }
  
  return { compatible: false, status: 'incompatible' }
}
