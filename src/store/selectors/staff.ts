/**
 * Selettori per Staff
 * 
 * Selettori puri per la tab Staff
 * Compatibili con l'architettura esistente
 */

import { DataStore } from '../dataStore'

// ============================================================================
// SELETTORI BASE
// ============================================================================

export const selectStaffMembers = (state: DataStore) => state.entities.staff

export const selectStaffDepartments = (state: DataStore) => state.entities.departments

// ============================================================================
// SELETTORI DERIVATI
// ============================================================================

export const selectStaffStats = (state: DataStore) => {
  const staff = state.entities.staff
  
  const total = staff.length
  const trained = staff.filter(member => member.haccpTraining).length
  const untrained = staff.filter(member => !member.haccpTraining).length
  
  return {
    total,
    trained,
    untrained
  }
}

export const selectStaffByDepartment = (departmentId: string) => (state: DataStore) => {
  return state.entities.staff.filter(member => member.department === departmentId)
}

export const selectStaffByRole = (role: string) => (state: DataStore) => {
  return state.entities.staff.filter(member => member.role === role)
}

export const selectTrainedStaff = (state: DataStore) => {
  return state.entities.staff.filter(member => member.haccpTraining)
}

export const selectUntrainedStaff = (state: DataStore) => {
  return state.entities.staff.filter(member => !member.haccpTraining)
}

export const selectStaffByTrainingStatus = (trained: boolean) => (state: DataStore) => {
  return state.entities.staff.filter(member => member.haccpTraining === trained)
}

// ============================================================================
// SELETTORI PER FORM
// ============================================================================

export const selectStaffFormState = (state: DataStore) => {
  return state?.meta?.forms?.staff || { mode: 'idle', draft: {}, errors: {} }
}

export const selectStaffFormErrors = (state: DataStore) => {
  const formState = selectStaffFormState(state)
  return formState.errors
}

export const selectStaffFormDraft = (state: DataStore) => {
  const formState = selectStaffFormState(state)
  return formState.draft
}
