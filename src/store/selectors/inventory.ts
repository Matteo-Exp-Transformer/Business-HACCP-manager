/**
 * Selettori per Inventario
 * 
 * Selettori puri per la tab Inventario
 * Compatibili con l'architettura esistente
 */

import { DataStore } from '../dataStore'

// ============================================================================
// SELETTORI BASE
// ============================================================================

export const selectInventoryItems = (state: DataStore) => state.entities.inventory

export const selectInventorySuppliers = (state: DataStore) => state.entities.suppliers

// ============================================================================
// SELETTORI DERIVATI
// ============================================================================

export const selectInventoryStats = (state: DataStore) => {
  const items = state.entities.inventory
  
  const total = items.length
  const fresh = items.filter(item => item.status === 'fresh').length
  const expiring = items.filter(item => item.status === 'expiring').length
  const expired = items.filter(item => item.status === 'expired').length
  
  return {
    total,
    fresh,
    expiring,
    expired
  }
}

export const selectExpiringItems = (state: DataStore) => {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  
  return state.entities.inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate)
    return expiryDate <= threeDaysFromNow && expiryDate >= now
  })
}

export const selectExpiredItems = (state: DataStore) => {
  const now = new Date()
  
  return state.entities.inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate)
    return expiryDate < now
  })
}

export const selectItemsByCategory = (category: string) => (state: DataStore) => {
  return state.entities.inventory.filter(item => item.category === category)
}

export const selectItemsBySupplier = (supplierId: string) => (state: DataStore) => {
  return state.entities.inventory.filter(item => item.supplier === supplierId)
}

export const selectItemsByLocation = (location: string) => (state: DataStore) => {
  return state.entities.inventory.filter(item => item.location === location)
}

// ============================================================================
// SELETTORI PER FORM
// ============================================================================

export const selectInventoryFormState = (state: DataStore) => {
  return state.meta.forms.inventory || { mode: 'idle', draft: {}, errors: {} }
}

export const selectInventoryFormErrors = (state: DataStore) => {
  const formState = selectInventoryFormState(state)
  return formState.errors
}

export const selectInventoryFormDraft = (state: DataStore) => {
  const formState = selectInventoryFormState(state)
  return formState.draft
}
