/**
 * Microcopy - Sistema di testi semplificati per Business HACCP Manager
 * 
 * Questo file contiene tutti i micro-testi semplificati e user-friendly
 * per migliorare l'esperienza utente e la chiarezza delle comunicazioni
 * 
 * @version 1.0
 * @critical User Experience - Comunicazione chiara
 */

export const MICROCOPY = {
  // Messaggi comuni semplificati
  common: {
    noData: "Prima crea un Frigo: vai a Punti di Conservazione.",
    noPermissions: "Non hai i permessi per questa azione.",
    saveSuccess: "Fatto!",
    saveError: "Errore nel salvataggio. Riprova.",
    deleteConfirm: "Sei sicuro di voler eliminare?",
    loading: "Caricamento...",
    noResults: "Nessun risultato trovato.",
    required: "Campo obbligatorio",
    invalidValue: "Valore non valido"
  },

  // Messaggi specifici per sezioni
  sections: {
    refrigerators: {
      empty: "Prima crea un Frigo: vai a Punti di Conservazione.",
      noTemperature: "Aggiungi una rilevazione per esportare il PDF.",
      invalidRange: "Valore fuori standard. Correggi i limiti.",
      locationHint: "Scegli il luogo più appropriato per il tipo di conservazione."
    },
    
    inventory: {
      empty: "Aggiungi il primo prodotto al tuo inventario.",
      noCategory: "Crea una categoria per organizzare i prodotti.",
      expiryWarning: "Controlla le date di scadenza regolarmente.",
      storageHint: "Assicurati che il prodotto sia compatibile con il frigorifero."
    },
    
    staff: {
      empty: "Aggiungi il primo membro del team.",
      noRole: "Assegna un ruolo per organizzare il personale.",
      certificationExpiring: "Attestato in scadenza. Rinnova presto.",
      certificationExpired: "Attestato scaduto. Richiedi rinnovo."
    },
    
    cleaning: {
      empty: "Crea la prima mansione di pulizia.",
      noDepartment: "Assegna un reparto per organizzare le mansioni.",
      overdue: "Mansione in ritardo. Completala presto.",
      completed: "Mansione completata con successo!"
    },
    
    temperature: {
      empty: "Aggiungi la prima rilevazione di temperatura.",
      noRefrigerator: "Crea un frigorifero prima di registrare temperature.",
      outOfRange: "Temperatura fuori range. Verifica il frigorifero.",
      exportHint: "Aggiungi almeno 1 rilevazione per esportare."
    }
  },

  // Messaggi di validazione HACCP
  validation: {
    temperature: {
      fridgeRange: "Range frigo: 2-4°C",
      freezerRange: "Range freezer: -18°C o inferiore",
      outOfRange: "Valore fuori standard HACCP",
      critical: "Temperatura critica! Azione immediata richiesta."
    },
    
    product: {
      incompatible: "Prodotto non compatibile con questo frigorifero",
      categoryMismatch: "Categoria prodotto non adatta alla temperatura",
      storageError: "Errore di conservazione rilevato"
    },
    
    staff: {
      certificationRequired: "Certificazione HACCP richiesta per questo ruolo",
      trainingNeeded: "Formazione aggiuntiva necessaria",
      roleMismatch: "Ruolo non adatto alle mansioni assegnate"
    }
  },

  // Messaggi di azione correttiva
  correctiveActions: {
    temperature: {
      high: "Se >4°C: sposta i prodotti e riprova tra 10 minuti",
      low: "Se <2°C: verifica il termostato e riprova",
      critical: "Evacua immediatamente e contatta il responsabile"
    },
    
    product: {
      expired: "Elimina il prodotto scaduto e registra la non conformità",
      contaminated: "Isola il prodotto e segnala al responsabile",
      wrongStorage: "Sposta il prodotto nel frigorifero corretto"
    },
    
    equipment: {
      malfunction: "Disattiva l'attrezzatura e richiedi manutenzione",
      dirty: "Pulisci immediatamente prima del prossimo utilizzo",
      calibration: "Richiedi calibrazione dell'attrezzatura"
    }
  },

  // Messaggi di conferma (Toast)
  toast: {
    success: {
      save: "Salvato con successo! ✅",
      delete: "Eliminato con successo! 🗑️",
      update: "Aggiornato con successo! ✏️",
      export: "Esportazione completata! 📤",
      import: "Importazione completata! 📥"
    },
    
    warning: {
      attention: "Attenzione richiesta! ⚠️",
      reminder: "Promemoria: azione necessaria! 🔔",
      validation: "Verifica i dati inseriti! 🔍"
    },
    
    error: {
      save: "Errore nel salvataggio! ❌",
      delete: "Errore nell'eliminazione! ❌",
      network: "Errore di connessione! 🌐",
      permission: "Permessi insufficienti! 🔒"
    }
  },

  // Empty states informativi
  emptyStates: {
    refrigerators: {
      title: "Nessun frigorifero configurato",
      description: "Inizia creando il tuo primo punto di conservazione",
      action: "Crea Frigorifero",
      hint: "I frigoriferi sono essenziali per la sicurezza alimentare"
    },
    
    inventory: {
      title: "Inventario vuoto",
      description: "Aggiungi i tuoi prodotti per iniziare la gestione",
      action: "Aggiungi Prodotto",
      hint: "L'inventario ti aiuta a tracciare scadenze e conservazione"
    },
    
    staff: {
      title: "Nessun membro del team",
      description: "Registra il personale per gestire le mansioni",
      action: "Aggiungi Membro",
      hint: "Il team è fondamentale per la compliance HACCP"
    },
    
    cleaning: {
      title: "Nessuna mansione configurata",
      description: "Crea le mansioni di pulizia per il tuo team",
      action: "Crea Mansione",
      hint: "Le pulizie regolari prevengono contaminazioni"
    },
    
    temperature: {
      title: "Nessuna rilevazione temperatura",
      description: "Registra le prime temperature per il monitoraggio",
      action: "Registra Temperatura",
      hint: "Il monitoraggio temperature è critico per la sicurezza"
    }
  },

  // Suggerimenti contestuali
  hints: {
    onboarding: "Completa l'onboarding per sbloccare tutte le funzionalità",
    firstUse: "Benvenuto! Inizia creando i tuoi primi elementi",
    optimization: "Suggerimento: organizza i prodotti per categoria",
    compliance: "Ricorda: le registrazioni HACCP sono obbligatorie",
    backup: "Fai backup regolari dei tuoi dati HACCP"
  }
}

// Funzione helper per ottenere messaggi
export const getMessage = (category, key, fallback = "Messaggio non disponibile") => {
  try {
    return MICROCOPY[category]?.[key] || fallback
  } catch (error) {
    console.warn(`Errore nel recupero messaggio: ${category}.${key}`)
    return fallback
  }
}

// Funzione per messaggi dinamici con parametri
export const formatMessage = (template, params = {}) => {
  let message = template
  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  return message
}

export default MICROCOPY

