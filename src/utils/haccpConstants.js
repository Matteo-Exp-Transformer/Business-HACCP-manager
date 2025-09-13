/**
 * Costanti HACCP per l'applicazione
 * Centralizza tutte le costanti relative alla sicurezza alimentare
 */

// Tolleranza HACCP per la validazione delle temperature
export const HACCP_TOLERANCE_C = 2

// Range di temperatura per ambiente
export const AMBIENT_RANGE_C = { min: 15, max: 25 }

// Categorie di prodotti standardizzate con giorni di scadenza
export const PRODUCT_CATEGORIES = {
  latticini: 7,    // 7 giorni
  carne: 3,        // 3 giorni  
  pesce: 2,        // 2 giorni
  verdura: 7,      // 7 giorni
  frutta: 7,       // 7 giorni
  conserva: 365,   // 365 giorni
  pane: 3,         // 3 giorni
  bevande: 30      // 30 giorni
}

// Chiavi localStorage standardizzate con prefisso haccp:
export const LOCALSTORAGE_KEYS = {
  INVENTORY: 'haccp:inventory',
  REFRIGERATORS: 'haccp:refrigerators', 
  USED_INGREDIENTS: 'haccp:used-ingredients',
  ONBOARDING: 'haccp:onboarding',
  SUPPLIERS: 'haccp:suppliers',
  ORDERS: 'haccp:orders',
  MIGRATED: 'haccp:migrated'
}

// Modalità di temperatura per punti di conservazione
export const TEMP_MODES = {
  FIXED: 'fixed',
  RANGE: 'range', 
  AMBIENT: 'ambient'
}

// Status delle temperature per colorazione UI
export const TEMP_STATUS = {
  GREEN: 'green',    // ≤ 1°C di differenza
  ORANGE: 'orange',  // ≤ 1.5°C di differenza  
  RED: 'red'         // ≥ 2°C di differenza
}

// Soglie per la colorazione delle temperature
export const TEMP_THRESHOLDS = {
  GREEN_MAX: 0.5,    // ≤ 0.5°C = verde
  ORANGE_MAX: 1.5,   // ≤ 1.5°C = arancione
  RED_MIN: 2         // ≥ 2°C = rosso
}
