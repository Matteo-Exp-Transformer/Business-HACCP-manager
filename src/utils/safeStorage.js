/**
 * Utility per operazioni sicure su localStorage
 * Previene errori di serializzazione e corruzione dati
 */

/**
 * Salva dati in localStorage in modo sicuro
 * @param {string} key - Chiave di storage
 * @param {any} data - Dati da salvare
 * @returns {boolean} - true se salvato con successo
 */
export const safeSetItem = (key, data) => {
  try {
    // Valida che i dati siano serializzabili
    if (data === undefined) {
      console.warn(`[SafeStorage] Tentativo di salvare undefined per chiave: ${key}`);
      return false;
    }

    // Serializza i dati
    const serialized = JSON.stringify(data);
    
    // Verifica che la serializzazione sia valida
    if (serialized === 'undefined' || serialized === 'null') {
      console.warn(`[SafeStorage] Dati non serializzabili per chiave: ${key}`);
      return false;
    }

    // Salva in localStorage
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[SafeStorage] Errore nel salvare ${key}:`, error);
    return false;
  }
};

/**
 * Carica dati da localStorage in modo sicuro
 * @param {string} key - Chiave di storage
 * @param {any} defaultValue - Valore di default se il caricamento fallisce
 * @returns {any} - Dati caricati o valore di default
 */
export const safeGetItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    
    if (item === null) {
      return defaultValue;
    }

    // Controlla se è la stringa corrotta "[object Object]"
    if (item === '[object Object]' || item === '[object Object]') {
      console.warn(`[SafeStorage] Dati corrotti rilevati per chiave: ${key}, rimuovendo...`);
      localStorage.removeItem(key);
      return defaultValue;
    }
    
    // Controlla se l'elemento inizia con "company_" (dati corrotti specifici)
    if (item.startsWith('company_') && !item.startsWith('"company_')) {
      console.warn(`[SafeStorage] Dati corrotti rilevati per chiave: ${key} (company_*), rimuovendo...`);
      localStorage.removeItem(key);
      return defaultValue;
    }

    // Prova a parsare i dati
    const parsed = JSON.parse(item);
    
    // Valida che i dati parsati siano validi
    if (parsed === undefined || parsed === null) {
      console.warn(`[SafeStorage] Dati non validi per chiave: ${key}`);
      return defaultValue;
    }

    return parsed;
  } catch (error) {
    console.error(`[SafeStorage] Errore nel caricare ${key}:`, error);
    // Rimuovi i dati corrotti
    localStorage.removeItem(key);
    return defaultValue;
  }
};

/**
 * Rimuove una chiave da localStorage in modo sicuro
 * @param {string} key - Chiave da rimuovere
 * @returns {boolean} - true se rimossa con successo
 */
export const safeRemoveItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[SafeStorage] Errore nel rimuovere ${key}:`, error);
    return false;
  }
};

/**
 * Pulisce tutti i dati HACCP dal localStorage
 * @returns {boolean} - true se pulizia completata
 */
export const clearHaccpData = () => {
  try {
    const keysToRemove = [
      'haccp-onboarding',
      'haccp-onboarding-new',
      'haccp-departments',
      'haccp-staff',
      'haccp-refrigerators',
      'haccp-cleaning',
      'haccp-products',
      'haccp-temperatures',
      'haccp-product-labels',
      'haccp-users',
      'haccp-current-user',
      'haccp-last-check',
      'haccp-last-sync',
      'haccp-company-id'
    ];

    keysToRemove.forEach(key => {
      safeRemoveItem(key);
    });

    console.log('[SafeStorage] Dati HACCP puliti con successo');
    return true;
  } catch (error) {
    console.error('[SafeStorage] Errore nella pulizia dati HACCP:', error);
    return false;
  }
};

/**
 * Verifica l'integrità dei dati in localStorage
 * @returns {Object} - Report dell'integrità
 */
export const checkDataIntegrity = () => {
  const report = {
    corrupted: [],
    valid: [],
    total: 0
  };

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('haccp-')) {
        report.total++;
        
        const item = localStorage.getItem(key);
        if (item === '[object Object]' || item === '[object Object]') {
          report.corrupted.push(key);
        } else {
          try {
            JSON.parse(item);
            report.valid.push(key);
          } catch {
            report.corrupted.push(key);
          }
        }
      }
    }
  } catch (error) {
    console.error('[SafeStorage] Errore nel controllo integrità:', error);
  }

  return report;
};
