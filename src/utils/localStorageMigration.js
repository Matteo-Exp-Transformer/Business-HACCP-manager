/**
 * Migrazione delle chiavi localStorage per standardizzare il prefisso haccp:
 * Migra le chiavi esistenti al nuovo formato con prefisso
 */

import { LOCALSTORAGE_KEYS } from './haccpConstants'

// Mappa delle chiavi vecchie -> nuove
const KEY_MIGRATION_MAP = {
  'haccp-inventory': LOCALSTORAGE_KEYS.INVENTORY,
  'haccp-refrigerators': LOCALSTORAGE_KEYS.REFRIGERATORS,
  'haccp-used-ingredients': LOCALSTORAGE_KEYS.USED_INGREDIENTS,
  'haccp-onboarding': LOCALSTORAGE_KEYS.ONBOARDING,
  'haccp-suppliers': LOCALSTORAGE_KEYS.SUPPLIERS,
  'haccp-orders': LOCALSTORAGE_KEYS.ORDERS,
  // Aggiungi altre chiavi se necessario
}

/**
 * Esegue la migrazione delle chiavi localStorage
 * Legge i dati dalle chiavi vecchie e li scrive nelle nuove chiavi
 * Imposta un flag per evitare migrazioni multiple
 */
export const migrateLocalStorageKeys = () => {
  // Controlla se la migrazione è già stata eseguita
  const migrationFlag = localStorage.getItem(LOCALSTORAGE_KEYS.MIGRATED)
  if (migrationFlag === 'true') {
    return
  }
  
  console.log('🔄 Iniziando migrazione chiavi localStorage...')
  
  let migratedCount = 0
  
  // Migra ogni chiave
  Object.entries(KEY_MIGRATION_MAP).forEach(([oldKey, newKey]) => {
    const oldData = localStorage.getItem(oldKey)
    
    if (oldData) {
      try {
        // Verifica che i dati siano validi JSON
        JSON.parse(oldData)
        
        // Copia i dati nella nuova chiave
        localStorage.setItem(newKey, oldData)
        console.log(`✅ Migrato: ${oldKey} -> ${newKey}`)
        migratedCount++
        
        // Rimuovi la chiave vecchia (opzionale, per sicurezza mantieni entrambe)
        // localStorage.removeItem(oldKey)
        
      } catch (error) {
        console.warn(`⚠️ Errore nel migrare ${oldKey}:`, error)
      }
    }
  })
  
  // Imposta il flag di migrazione completata
  localStorage.setItem(LOCALSTORAGE_KEYS.MIGRATED, 'true')
  
  console.log(`🎉 Migrazione completata: ${migratedCount} chiavi migrate`)
}

/**
 * Ottiene i dati da localStorage usando le chiavi standardizzate
 * @param {string} key - Chiave (usare LOCALSTORAGE_KEYS)
 * @returns {any} - Dati parsati o null
 */
export const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error(`Errore nel leggere ${key}:`, error)
    return null
  }
}

/**
 * Salva i dati in localStorage usando le chiavi standardizzate
 * @param {string} key - Chiave (usare LOCALSTORAGE_KEYS)
 * @param {any} data - Dati da salvare
 */
export const setLocalStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Errore nel salvare ${key}:`, error)
  }
}
