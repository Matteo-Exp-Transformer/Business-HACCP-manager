/**
 * Selettori per Punti di Conservazione
 * 
 * Selettori puri per la tab Punti di Conservazione
 * Compatibili con l'architettura esistente e nuova ConservationPoint
 */

import { DataStore } from '../dataStore'
import { CONSERVATION_POINT_HELPERS } from '../../utils/haccpRules'

// ============================================================================
// SELETTORI BASE
// ============================================================================

// Selettori legacy per compatibilità
export const selectConservationRefrigerators = (state: DataStore) => state.entities.refrigerators

export const selectConservationTemperatures = (state: DataStore) => state.entities.temperatures

export const selectConservationDepartments = (state: DataStore) => state.entities.departments

// Nuovi selettori per ConservationPoint
export const selectConservationPoints = (state: DataStore) => {
  if (!state?.entities?.conservationPoints) {
    return {}
  }
  return state.entities.conservationPoints
}

export const selectConservationPointsList = (state: DataStore) => {
  const points = selectConservationPoints(state)
  return Object.values(points)
}

// Selettore per mappatura onboarding → ConservationPoint
export const selectConservationPointsFromOnboarding = (state: DataStore) => {
  const onboarding = state?.onboarding
  if (!onboarding) return []

  // Estrai dati dall'onboarding (adatta ai campi reali)
  const refrigerators = onboarding.refrigerators || []
  
  return refrigerators.map(ref => {
    const mapped = CONSERVATION_POINT_HELPERS.mapOnboardingToConservationPoint(ref)
    return mapped
  }).filter(Boolean)
}

// ============================================================================
// SELETTORI DERIVATI
// ============================================================================

export const selectConservationStats = (state: DataStore) => {
  // Gestisci il caso in cui il store non è inizializzato
  if (!state || !state.entities) {
    return { total: 0, compliant: 0, critical: 0, recent: 0 }
  }
  
  // Usa ConservationPoint se disponibili, altrimenti fallback a refrigerators
  const conservationPoints = selectConservationPointsList(state)
  const refrigerators = state.entities.refrigerators || []
  const temperatures = state.entities.temperatures || []
  
  const total = conservationPoints.length > 0 ? conservationPoints.length : refrigerators.length
  
  // Calcola compliant basato su ConservationPoint o refrigerators
  let compliant = 0
  if (conservationPoints.length > 0) {
    compliant = conservationPoints.filter(point => point.status === 'OK').length
  } else {
    compliant = refrigerators.filter(ref => {
      const lastTemp = temperatures
        .filter(t => t.refrigeratorId === ref.id)
        .sort((a, b) => new Date(b.timestamp).toISOString().localeCompare(a.timestamp))[0]
      
      if (!lastTemp) return false
      
      const temp = parseFloat(lastTemp.temperature.toString())
      const targetTemp = parseFloat(ref.targetTemp.toString())
      const tolerance = 2 // ±2°C di tolleranza
      
      return Math.abs(temp - targetTemp) <= tolerance
    }).length
  }

  const criticalTemps = temperatures.filter(t => t.status === 'danger').length
  
  const recentTemps = temperatures.filter(t => {
    const tempDate = new Date(t.timestamp)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return tempDate > oneDayAgo
  }).length

  return {
    total,
    compliant,
    critical: criticalTemps,
    recent: recentTemps
  }
}

export const selectConservationType = (refrigerator: any) => {
  const temp = parseFloat(refrigerator.targetTemp)
  
  // Priorità 1: Abbattitore
  if (refrigerator.isAbbattitore) {
    return 'abbattitore'
  }
  
  // Priorità 2: Freezer (temperatura <= -15°C)
  if (temp <= -15) {
    return 'freezer'
  }
  
  // Priorità 3: Ambiente (temperatura > 0°C)
  if (temp > 0) {
    return 'ambiente'
  }
  
  // Default: Frigorifero (temperatura tra -15°C e 0°C)
  return 'frigorifero'
}

export const selectGroupedRefrigerators = (state: DataStore) => {
  // Gestisci il caso in cui il store non è inizializzato
  if (!state || !state.entities) {
    return { frigorifero: [], freezer: [], abbattitore: [], ambiente: [] }
  }
  
  // Usa ConservationPoint se disponibili, altrimenti fallback a refrigerators
  const conservationPoints = selectConservationPointsList(state)
  const refrigerators = state.entities.refrigerators || []
  
  const groups = {
    'frigorifero': [],
    'freezer': [],
    'abbattitore': [],
    'ambiente': []
  }

  if (conservationPoints.length > 0) {
    // Usa ConservationPoint con mapping tipo
    conservationPoints.forEach(point => {
      const typeMap = {
        'FRIGO': 'frigorifero',
        'FREEZER': 'freezer', 
        'ABBATTITORE': 'abbattitore',
        'AMBIENTE': 'ambiente'
      }
      const groupType = typeMap[point.type] || 'frigorifero'
      groups[groupType].push(point)
    })
  } else {
    // Fallback a refrigerators legacy
    refrigerators.forEach(refrigerator => {
      const type = selectConservationType(refrigerator)
      groups[type].push(refrigerator)
    })
  }

  return groups
}

export const selectConservationTypeConfig = (type: string) => {
  const configs = {
    'frigorifero': {
      label: 'Frigoriferi',
      textColor: 'text-blue-800',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      emptyBg: 'bg-blue-50',
      emptyTextColor: 'text-blue-800',
      emptyMessage: 'Nessun frigorifero configurato'
    },
    'freezer': {
      label: 'Freezer',
      textColor: 'text-purple-800',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      emptyBg: 'bg-purple-50',
      emptyTextColor: 'text-purple-800',
      emptyMessage: 'Nessun freezer configurato'
    },
    'abbattitore': {
      label: 'Abbattitore',
      textColor: 'text-red-800',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      emptyBg: 'bg-red-50',
      emptyTextColor: 'text-red-800',
      emptyMessage: 'Nessun abbattitore configurato'
    },
    'ambiente': {
      label: 'Ambiente',
      textColor: 'text-green-800',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      emptyBg: 'bg-green-50',
      emptyTextColor: 'text-green-800',
      emptyMessage: 'Nessun punto ambiente configurato'
    }
  }

  return configs[type] || configs['frigorifero']
}

// ============================================================================
// SELETTORI PER TEMPERATURE
// ============================================================================

export const selectTemperatureHistory = (refrigeratorId: string) => (state: DataStore) => {
  return state.entities.temperatures
    .filter(t => t.refrigeratorId === refrigeratorId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export const selectLastTemperature = (refrigeratorId: string) => (state: DataStore) => {
  return state.entities.temperatures
    .filter(t => t.refrigeratorId === refrigeratorId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
}

export const selectTemperatureStatus = (refrigeratorId: string) => (state: DataStore) => {
  const lastTemp = selectLastTemperature(refrigeratorId)(state)
  const refrigerator = state.entities.refrigerators.find(r => r.id === refrigeratorId)
  
  if (!lastTemp || !refrigerator) return 'unknown'
  
  const temp = parseFloat(lastTemp.temperature.toString())
  const targetTemp = parseFloat(refrigerator.targetTemp.toString())
  const tolerance = 2
  
  const diff = Math.abs(temp - targetTemp)
  
  if (diff <= tolerance) return 'compliant'
  if (diff <= tolerance * 2) return 'warning'
  return 'critical'
}

// ============================================================================
// SELETTORI PER FORM
// ============================================================================

export const selectConservationFormState = (state: DataStore) => {
  return state?.meta?.forms?.refrigerators || { mode: 'idle', draft: {}, errors: {} }
}

export const selectConservationFormErrors = (state: DataStore) => {
  const formState = selectConservationFormState(state)
  return formState.errors
}

export const selectConservationFormDraft = (state: DataStore) => {
  const formState = selectConservationFormState(state)
  return formState.draft
}
