/**
 * Funzioni di migrazione per convertire i dati esistenti al nuovo formato normalizzato
 * Gestisce la conversione da formati legacy a modelli tipizzati
 */

import { TEMP_MODES } from './haccpConstants'
import { parseSetTemperature } from './temperatureHelpers'

/**
 * Migra un punto di conservazione dal formato legacy al nuovo formato normalizzato
 * @param {Object} legacyPoint - Punto di conservazione in formato legacy
 * @returns {Object} - Punto di conservazione normalizzato
 */
export const migrateConservationPoint = (legacyPoint) => {
  // Parsa la temperatura usando l'helper centralizzato
  const tempInfo = parseSetTemperature(legacyPoint)
  
  // Estrae il nome del reparto da location o department
  const departmentName = legacyPoint.location || legacyPoint.department || undefined
  
  // Migra le categorie selezionate
  const storageCategoryIds = legacyPoint.selectedCategories || []
  
  // Migra i dati di manutenzione
  const maintenance = {
    temperature_monitoring: legacyPoint.maintenanceData?.temperature_monitoring || null,
    sanitization: legacyPoint.maintenanceData?.sanitization || null,
    defrosting: legacyPoint.maintenanceData?.defrosting || null
  }
  
  // Crea il punto normalizzato
  const normalizedPoint = {
    id: legacyPoint.id || `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: legacyPoint.name || 'Punto senza nome',
    departmentId: legacyPoint.departmentId || undefined,
    departmentName: departmentName,
    setTempMode: tempInfo.mode,
    setTempC: tempInfo.value,
    setTempRangeC: tempInfo.range,
    storageCategoryIds: storageCategoryIds,
    isBlastChiller: legacyPoint.isAbbattitore || false,
    maintenance: maintenance,
    createdAt: legacyPoint.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Pulisce i campi undefined per il modo 'fixed'
  if (tempInfo.mode === TEMP_MODES.FIXED) {
    delete normalizedPoint.setTempRangeC
  }
  
  // Pulisce i campi undefined per il modo 'range'
  if (tempInfo.mode === TEMP_MODES.RANGE) {
    delete normalizedPoint.setTempC
  }
  
  // Pulisce i campi undefined per il modo 'ambient'
  if (tempInfo.mode === TEMP_MODES.AMBIENT) {
    delete normalizedPoint.setTempC
    delete normalizedPoint.setTempRangeC
  }
  
  return normalizedPoint
}

/**
 * Migra un prodotto dal formato legacy al nuovo formato normalizzato
 * @param {Object} legacyProduct - Prodotto in formato legacy
 * @returns {Object} - Prodotto normalizzato
 */
export const migrateProduct = (legacyProduct) => {
  return {
    id: legacyProduct.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: legacyProduct.name || 'Prodotto senza nome',
    categoryId: legacyProduct.category || '',
    departmentName: legacyProduct.department || '',
    conservationPointName: legacyProduct.conservationPoint || '',
    expiryDate: legacyProduct.expiryDate || '',
    allergens: legacyProduct.allergens || [],
    notes: legacyProduct.notes || undefined,
    lotNumber: legacyProduct.lotNumber || undefined,
    batchDeliveryDate: legacyProduct.batchDeliveryDate || undefined,
    supplierName: legacyProduct.supplierName || undefined,
    orderId: legacyProduct.associatedOrderId || undefined,
    addedAt: legacyProduct.addedAt || new Date().toISOString()
  }
}

/**
 * Migra un log temperatura dal formato legacy al nuovo formato normalizzato
 * @param {Object} legacyLog - Log temperatura in formato legacy
 * @returns {Object} - Log temperatura normalizzato
 */
export const migrateTemperatureLog = (legacyLog) => {
  return {
    id: legacyLog.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conservationPointId: legacyLog.conservationPointId || '',
    conservationPointName: legacyLog.location || legacyLog.conservationPointName || '',
    temperatureC: legacyLog.temperature || legacyLog.temperatureC || 0,
    timestamp: legacyLog.timestamp || new Date().toISOString(),
    userId: legacyLog.userId || undefined,
    userName: legacyLog.userName || undefined,
    userDepartment: legacyLog.userDepartment || undefined,
    notes: legacyLog.notes || undefined
  }
}

/**
 * Migra tutti i punti di conservazione in un array
 * @param {Array} legacyPoints - Array di punti in formato legacy
 * @returns {Array} - Array di punti normalizzati
 */
export const migrateConservationPoints = (legacyPoints) => {
  if (!Array.isArray(legacyPoints)) return []
  
  return legacyPoints.map(point => migrateConservationPoint(point))
}

/**
 * Migra tutti i prodotti in un array
 * @param {Array} legacyProducts - Array di prodotti in formato legacy
 * @returns {Array} - Array di prodotti normalizzati
 */
export const migrateProducts = (legacyProducts) => {
  if (!Array.isArray(legacyProducts)) return []
  
  return legacyProducts.map(product => migrateProduct(product))
}

/**
 * Migra tutti i log temperatura in un array
 * @param {Array} legacyLogs - Array di log in formato legacy
 * @returns {Array} - Array di log normalizzati
 */
export const migrateTemperatureLogs = (legacyLogs) => {
  if (!Array.isArray(legacyLogs)) return []
  
  return legacyLogs.map(log => migrateTemperatureLog(log))
}

/**
 * Verifica se un punto di conservazione è già nel formato normalizzato
 * @param {Object} point - Punto di conservazione da verificare
 * @returns {boolean} - True se è normalizzato
 */
export const isConservationPointNormalized = (point) => {
  return point && 
    typeof point.setTempMode === 'string' &&
    ['fixed', 'range', 'ambient'].includes(point.setTempMode) &&
    !point.setTemperature && // Non dovrebbe avere il campo legacy
    !point.targetTemp // Non dovrebbe avere il campo legacy
}

/**
 * Verifica se un prodotto è già nel formato normalizzato
 * @param {Object} product - Prodotto da verificare
 * @returns {boolean} - True se è normalizzato
 */
export const isProductNormalized = (product) => {
  return product && 
    typeof product.categoryId === 'string' &&
    !product.category // Non dovrebbe avere il campo legacy
}

/**
 * Esegue la migrazione automatica dei dati se necessario
 * @param {Object} data - Dati da migrare
 * @returns {Object} - Dati migrati
 */
export const autoMigrateData = (data) => {
  const result = { ...data }
  
  // Migra punti di conservazione se necessario
  if (result.conservationPoints && Array.isArray(result.conservationPoints)) {
    const needsMigration = result.conservationPoints.some(point => 
      !isConservationPointNormalized(point)
    )
    
    if (needsMigration) {
      console.log('🔄 Migrando punti di conservazione al formato normalizzato...')
      result.conservationPoints = migrateConservationPoints(result.conservationPoints)
    }
  }
  
  // Migra prodotti se necessario
  if (result.products && Array.isArray(result.products)) {
    const needsMigration = result.products.some(product => 
      !isProductNormalized(product)
    )
    
    if (needsMigration) {
      console.log('🔄 Migrando prodotti al formato normalizzato...')
      result.products = migrateProducts(result.products)
    }
  }
  
  // Migra log temperatura se necessario
  if (result.temperatureLogs && Array.isArray(result.temperatureLogs)) {
    console.log('🔄 Migrando log temperatura al formato normalizzato...')
    result.temperatureLogs = migrateTemperatureLogs(result.temperatureLogs)
  }
  
  return result
}
