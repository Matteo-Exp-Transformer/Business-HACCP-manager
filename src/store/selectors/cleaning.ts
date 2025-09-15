/**
 * Selettori per Pulizie
 * 
 * Selettori puri per la tab Pulizie
 * Compatibili con l'architettura esistente
 */

import { DataStore } from '../dataStore'

// ============================================================================
// SELETTORI BASE
// ============================================================================

export const selectCleaningTasks = (state: DataStore) => state.entities.cleaning

export const selectCleaningStaff = (state: DataStore) => state.entities.staff

export const selectCleaningDepartments = (state: DataStore) => state.entities.departments

// ============================================================================
// SELETTORI DERIVATI
// ============================================================================

export const selectCleaningStats = (state: DataStore) => {
  const tasks = state.entities.cleaning
  
  const total = tasks.length
  const completed = tasks.filter(task => task.completed).length
  const pending = tasks.filter(task => !task.completed).length
  
  return {
    total,
    completed,
    pending
  }
}

export const selectPendingTasks = (state: DataStore) => {
  return state.entities.cleaning.filter(task => !task.completed)
}

export const selectCompletedTasks = (state: DataStore) => {
  return state.entities.cleaning.filter(task => task.completed)
}

export const selectTasksByDepartment = (departmentId: string) => (state: DataStore) => {
  return state.entities.cleaning.filter(task => task.department === departmentId)
}

export const selectTasksByStaff = (staffId: string) => (state: DataStore) => {
  return state.entities.cleaning.filter(task => task.operator === staffId)
}

export const selectTasksByFrequency = (frequency: string) => (state: DataStore) => {
  return state.entities.cleaning.filter(task => task.frequency === frequency)
}

export const selectRecentTasks = (days: number = 7) => (state: DataStore) => {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  
  return state.entities.cleaning.filter(task => {
    const taskDate = new Date(task.timestamp)
    return taskDate >= cutoffDate
  })
}

// ============================================================================
// SELETTORI PER FORM
// ============================================================================

export const selectCleaningFormState = (state: DataStore) => {
  return state.meta.forms.cleaning || { mode: 'idle', draft: {}, errors: {} }
}

export const selectCleaningFormErrors = (state: DataStore) => {
  const formState = selectCleaningFormState(state)
  return formState.errors
}

export const selectCleaningFormDraft = (state: DataStore) => {
  const formState = selectCleaningFormState(state)
  return formState.draft
}
