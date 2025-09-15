/**
 * Selettori per Punti di Conservazione
 * 
 * Selettori puri per la tab Punti di Conservazione
 * Compatibili con l'architettura esistente
 */

import { DataStore } from '../dataStore'

// ============================================================================
// SELETTORI BASE
// ============================================================================

export const selectConservationRefrigerators = (state: DataStore) => state.entities.refrigerators

export const selectConservationTemperatures = (state: DataStore) => state.entities.temperatures

export const selectConservationDepartments = (state: DataStore) => state.entities.departments

// ============================================================================
// SELETTORI DERIVATI
// ============================================================================

export const selectConservationStats = (state: DataStore) => {
  const refrigerators = state.entities.refrigerators
  const temperatures = state.entities.temperatures
  
  const totalRefrigerators = refrigerators.length
  
  const compliantRefrigerators = refrigerators.filter(ref => {
    const lastTemp = temperatures
      .filter(t => t.refrigeratorId === ref.id)
      .sort((a, b) => new Date(b.timestamp).toISOString().localeCompare(a.timestamp))[0]
    
    if (!lastTemp) return false
    
    const temp = parseFloat(lastTemp.temperature.toString())
    const targetTemp = parseFloat(ref.targetTemp.toString())
    const tolerance = 2 // ±2°C di tolleranza
    
    return Math.abs(temp - targetTemp) <= tolerance
  }).length

  const criticalTemps = temperatures.filter(t => t.status === 'danger').length
  
  const recentTemps = temperatures.filter(t => {
    const tempDate = new Date(t.timestamp)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return tempDate > oneDayAgo
  }).length

  return {
    total: totalRefrigerators,
    compliant: compliantRefrigerators,
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
  const refrigerators = state.entities.refrigerators
  const groups = {
    'frigorifero': [],
    'freezer': [],
    'abbattitore': [],
    'ambiente': []
  }

  refrigerators.forEach(refrigerator => {
    const type = selectConservationType(refrigerator)
    groups[type].push(refrigerator)
  })

  return groups
}

export const selectConservationTypeConfig = (type: string) => {
  const configs = {
    'frigorifero': {
      label: 'Frigoriferi',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      emptyBg: 'bg-blue-50',
      emptyTextColor: 'text-blue-600',
      emptyMessage: 'Nessun frigorifero configurato'
    },
    'freezer': {
      label: 'Freezer',
      textColor: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      borderColor: 'border-cyan-300',
      emptyBg: 'bg-cyan-50',
      emptyTextColor: 'text-cyan-600',
      emptyMessage: 'Nessun freezer configurato'
    },
    'abbattitore': {
      label: 'Abbattitori',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-300',
      emptyBg: 'bg-orange-50',
      emptyTextColor: 'text-orange-600',
      emptyMessage: 'Nessun abbattitore configurato'
    },
    'ambiente': {
      label: 'Ambiente',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      emptyBg: 'bg-green-50',
      emptyTextColor: 'text-green-600',
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
  return state.meta.forms.refrigerators || { mode: 'idle', draft: {}, errors: {} }
}

export const selectConservationFormErrors = (state: DataStore) => {
  const formState = selectConservationFormState(state)
  return formState.errors
}

export const selectConservationFormDraft = (state: DataStore) => {
  const formState = selectConservationFormState(state)
  return formState.draft
}
