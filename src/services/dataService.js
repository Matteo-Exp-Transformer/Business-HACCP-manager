/**
 * DataService - Servizio centralizzato per gestione dati HACCP
 * 
 * Risolve i problemi critici di persistenza:
 * - Conflitti di parsing JSON
 * - Duplicazione dati
 * - Gestione errori unificata
 * - Backup automatico
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Persistenza dati
 */

class DataService {
  static KEYS = {
    TEMPERATURES: 'haccp-temperatures',
    REFRIGERATORS: 'haccp-refrigerators', 
    CLEANING: 'haccp-cleaning',
    STAFF: 'haccp-staff',
    PRODUCTS: 'haccp-products',
    DEPARTMENTS: 'haccp-departments',
    CUSTOM_CATEGORIES: 'haccp-custom-categories',
    USERS: 'haccp-users',
    ONBOARDING: 'haccp-onboarding',
    BUSINESS_INFO: 'haccp-business-info',
    PRESETS: 'haccp-presets',
    ACTIONS: 'haccp-actions',
    LAST_CHECK: 'haccp-last-check',
    LAST_SYNC: 'haccp-last-sync',
    SHOW_CHAT_ICON: 'haccp-show-chat-icon',
    COMPANY_ID: 'haccp-company-id',
    DEV_MODE: 'haccp-dev-mode',
    CURRENT_USER: 'haccp-current-user',
    PRODUCT_LABELS: 'haccp-product-labels'
  }

  static async save(key, data) {
    try {
      // Validazione dati prima del salvataggio
      this.validateData(key, data)
      
      const serialized = JSON.stringify(data)
      localStorage.setItem(key, serialized)
      
      // Log per debugging
      console.log(`✅ DataService: Salvato ${key}:`, data?.length || 'oggetto')
      
      // Sincronizzazione cloud opzionale
      await this.syncToCloud(key, data)
      
      return { success: true, data }
    } catch (error) {
      console.error(`❌ DataService: Errore salvataggio ${key}:`, error)
      return this.handleSaveError(key, error, data)
    }
  }

  static async load(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaultValue
      
      const parsed = JSON.parse(stored)
      
      // Validazione dati dopo il caricamento
      this.validateData(key, parsed)
      
      console.log(`📥 DataService: Caricato ${key}:`, parsed?.length || 'oggetto')
      return parsed
    } catch (error) {
      console.error(`❌ DataService: Errore caricamento ${key}:`, error)
      return this.recoverData(key, error, defaultValue)
    }
  }

  static validateData(key, data) {
    // Validazioni specifiche per tipo di dato
    if (key === this.KEYS.TEMPERATURES && data) {
      if (!Array.isArray(data)) throw new Error('Temperature deve essere array')
    }
    if (key === this.KEYS.PRODUCTS && data) {
      if (!Array.isArray(data)) throw new Error('Products deve essere array')
    }
    if (key === this.KEYS.REFRIGERATORS && data) {
      if (!Array.isArray(data)) throw new Error('Refrigerators deve essere array')
    }
    if (key === this.KEYS.CLEANING && data) {
      if (!Array.isArray(data)) throw new Error('Cleaning deve essere array')
    }
    if (key === this.KEYS.STAFF && data) {
      if (!Array.isArray(data)) throw new Error('Staff deve essere array')
    }
    if (key === this.KEYS.DEPARTMENTS && data) {
      if (!Array.isArray(data)) throw new Error('Departments deve essere array')
    }
    if (key === this.KEYS.USERS && data) {
      if (!Array.isArray(data)) throw new Error('Users deve essere array')
    }
    if (key === this.KEYS.PRODUCT_LABELS && data) {
      if (!Array.isArray(data)) throw new Error('ProductLabels deve essere array')
    }
    if (key === this.KEYS.CUSTOM_CATEGORIES && data) {
      if (!Array.isArray(data)) throw new Error('CustomCategories deve essere array')
    }
  }

  static handleSaveError(key, error, data) {
    // Strategia di recovery per errori di salvataggio
    const backupKey = `${key}_backup_${Date.now()}`
    try {
      // Salva backup con timestamp
      localStorage.setItem(backupKey, JSON.stringify({
        originalKey: key,
        data,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      console.log(`💾 DataService: Backup salvato: ${backupKey}`)
    } catch (backupError) {
      console.error('❌ DataService: Fallito anche il backup:', backupError)
    }
    
    return { success: false, error: error.message, backupKey }
  }

  static recoverData(key, error, defaultValue) {
    console.warn(`🔧 DataService: Tentativo recovery per ${key}`)
    
    // Cerca backup recenti
    const backups = this.findBackups(key)
    if (backups.length > 0) {
      try {
        const latestBackup = backups[0]
        const backupData = JSON.parse(localStorage.getItem(latestBackup))
        console.log(`✅ DataService: Recovery da backup: ${latestBackup}`)
        return backupData.data
      } catch (recoveryError) {
        console.error('❌ DataService: Recovery fallito:', recoveryError)
      }
    }
    
    // Ritorna valore di default
    console.log(`🔄 DataService: Usando valore default per ${key}`)
    return defaultValue
  }

  static findBackups(key) {
    const backupPrefix = `${key}_backup_`
    return Object.keys(localStorage)
      .filter(k => k.startsWith(backupPrefix))
      .sort((a, b) => b.localeCompare(a)) // Più recenti prima
  }

  static async syncToCloud(key, data) {
    // Implementazione sincronizzazione Supabase
    if (!this.isCloudEnabled()) return
    
    try {
      // Qui implementerai la sincronizzazione con Supabase
      console.log(`☁️ DataService: Sync cloud per ${key}`)
    } catch (error) {
      console.warn('⚠️ DataService: Sync cloud fallita:', error)
    }
  }

  static isCloudEnabled() {
    return localStorage.getItem('haccp-cloud-sync') === 'true'
  }

  // Metodo per eliminare duplicati
  static async cleanupDuplicates() {
    console.log('🧹 DataService: Avvio pulizia duplicati...')
    
    const duplicates = [
      { main: this.KEYS.PRODUCTS, duplicates: ['haccp-inventory'] }
    ]
    
    for (const { main, duplicates: dups } of duplicates) {
      const mainData = await this.load(main, [])
      
      for (const dup of dups) {
        const dupData = await this.load(dup, [])
        if (dupData.length > 0 && mainData.length === 0) {
          // Migra i dati dal duplicato alla chiave principale
          await this.save(main, dupData)
          localStorage.removeItem(dup)
          console.log(`🧹 DataService: Migrato ${dup} → ${main}`)
        } else if (dupData.length > 0) {
          localStorage.removeItem(dup)
          console.log(`🧹 DataService: Rimosso duplicato: ${dup}`)
        }
      }
    }
    
    console.log('✅ DataService: Pulizia duplicati completata')
  }

  // Metodo per pulire dati corrotti
  static async cleanupCorruptedData() {
    console.log('🧹 DataService: Avvio pulizia dati corrotti...')
    
    const corruptedKeys = []
    
    // Controlla tutte le chiavi HACCP
    Object.values(this.KEYS).forEach(key => {
      try {
        const stored = localStorage.getItem(key)
        if (stored && stored !== 'null' && stored !== 'undefined') {
          JSON.parse(stored)
        }
      } catch (error) {
        console.warn(`⚠️ DataService: Dati corrotti trovati in ${key}:`, error.message)
        corruptedKeys.push(key)
      }
    })
    
    // Rimuovi dati corrotti
    corruptedKeys.forEach(key => {
      localStorage.removeItem(key)
      console.log(`🗑️ DataService: Rimosso ${key} corrotto`)
    })
    
    console.log(`✅ DataService: Pulizia completata. Rimosse ${corruptedKeys.length} chiavi corrotte`)
    return corruptedKeys
  }

  // Metodo per esportare tutti i dati
  static async exportAllData() {
    const allData = {}
    
    for (const [name, key] of Object.entries(this.KEYS)) {
      allData[name] = await this.load(key, [])
    }
    
    allData.exportDate = new Date().toISOString()
    allData.version = '1.0'
    
    return allData
  }

  // Metodo per importare dati
  static async importData(importedData) {
    try {
      for (const [name, data] of Object.entries(importedData)) {
        if (name === 'exportDate' || name === 'version') continue
        
        const key = this.KEYS[name.toUpperCase()]
        if (key) {
          await this.save(key, data)
          console.log(`📥 DataService: Importato ${name}`)
        }
      }
      return { success: true }
    } catch (error) {
      console.error('❌ DataService: Errore import:', error)
      return { success: false, error: error.message }
    }
  }
}

export default DataService
