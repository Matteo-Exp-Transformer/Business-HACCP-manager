/**
 * Traduzioni Italiane - Foundation Pack v1
 * 
 * Dizionario italiano per messaggi di validazione e UX
 * 
 * @version 1.0
 * @critical Architettura - i18n italiano
 */

export const it = {
  // ============================================================================
  // VALIDAZIONE
  // ============================================================================
  validation: {
    required: 'Campo obbligatorio',
    minLength: 'Deve essere di almeno {{min}} caratteri',
    maxLength: 'Non può superare {{max}} caratteri',
    min: 'Deve essere almeno {{min}}',
    max: 'Non può superare {{max}}',
    email: 'Email non valida',
    phone: 'Numero di telefono non valido',
    url: 'URL non valido',
    pattern: 'Formato non valido',
    custom: 'Valore non valido',
    
    // Validazioni specifiche HACCP
    temperature: {
      tooLow: 'Temperatura troppo bassa (min -50°C)',
      tooHigh: 'Temperatura troppo alta (max 50°C)',
      outOfRange: 'Temperatura {{temp}}°C fuori range {{min}}-{{max}}°C',
      invalid: 'Temperatura non valida'
    },
    
    refrigerator: {
      nameRequired: 'Nome frigorifero obbligatorio',
      locationRequired: 'Posizione obbligatoria',
      tempRequired: 'Temperatura target obbligatoria',
      categoriesMax: 'Puoi selezionare al massimo 5 categorie'
    },
    
    staff: {
      nameRequired: 'Nome completo obbligatorio',
      roleRequired: 'Ruolo obbligatorio',
      departmentRequired: 'Reparto obbligatorio',
      emailInvalid: 'Email non valida',
      phoneInvalid: 'Numero di telefono non valido'
    },
    
    inventory: {
      nameRequired: 'Nome prodotto obbligatorio',
      categoryRequired: 'Categoria obbligatoria',
      supplierRequired: 'Fornitore obbligatorio',
      quantityInvalid: 'Quantità non può essere negativa',
      expiryDateInvalid: 'Data di scadenza non valida',
      expiryDatePast: 'Data di scadenza già passata'
    },
    
    department: {
      nameRequired: 'Nome reparto obbligatorio',
      nameMinLength: 'Nome reparto deve essere di almeno 2 caratteri',
      nameUnique: 'I nomi dei reparti devono essere unici'
    },
    
    supplier: {
      nameRequired: 'Nome fornitore obbligatorio',
      categoryRequired: 'Categoria obbligatoria',
      contactRequired: 'Contatto obbligatorio',
      documentationRequired: 'Documentazione obbligatoria'
    }
  },

  // ============================================================================
  // MESSAGGI HACCP
  // ============================================================================
  haccp: {
    compliance: {
      compliant: 'Compliant',
      warning: 'Attenzione',
      critical: 'Critico',
      unknown: 'Sconosciuto'
    },
    
    temperature: {
      status: {
        ok: 'OK',
        warning: 'Attenzione',
        danger: 'Pericolo'
      },
      tolerance: 'Tolleranza ±{{tolerance}}°C',
      target: 'Target: {{target}}°C',
      current: 'Attuale: {{current}}°C',
      difference: 'Differenza: {{diff}}°C'
    },
    
    categories: {
      incompatible: 'Categorie incompatibili selezionate',
      maxReached: 'Limite massimo di 5 categorie raggiunto',
      selectAtLeastOne: 'Seleziona almeno una categoria'
    },
    
    maintenance: {
      required: 'Manutenzione richiesta',
      overdue: 'Manutenzione in ritardo',
      scheduled: 'Manutenzione programmata',
      completed: 'Manutenzione completata'
    },
    
    alerts: {
      temperatureOutOfRange: 'Temperatura fuori range: {{temp}}°C vs {{target}}°C',
      productExpiring: 'Prodotto in scadenza tra meno di 3 giorni',
      productExpired: 'Prodotto scaduto',
      maintenanceOverdue: 'Manutenzione in ritardo per {{item}}',
      noData: 'Nessun dato disponibile'
    }
  },

  // ============================================================================
  // MESSAGGI UX
  // ============================================================================
  ui: {
    buttons: {
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      close: 'Chiudi',
      confirm: 'Conferma',
      retry: 'Riprova',
      refresh: 'Aggiorna',
      back: 'Indietro',
      next: 'Avanti',
      finish: 'Termina'
    },
    
    messages: {
      success: 'Operazione completata con successo',
      error: 'Si è verificato un errore',
      warning: 'Attenzione',
      info: 'Informazione',
      loading: 'Caricamento...',
      saving: 'Salvataggio...',
      deleting: 'Eliminazione...',
      noData: 'Nessun dato disponibile',
      noResults: 'Nessun risultato trovato',
      tryAgain: 'Riprova più tardi'
    },
    
    forms: {
      required: 'Campi obbligatori',
      optional: 'Campi opzionali',
      draft: 'Bozza salvata',
      conflict: 'Un form per {{entity}} è già aperto. Chiudilo prima di aprirne un altro.',
      validation: 'Validazione in corso...',
      submitting: 'Invio in corso...',
      submitted: 'Form inviato con successo',
      error: 'Errore nell\'invio del form'
    },
    
    navigation: {
      home: 'Home',
      conservation: 'Punti di Conservazione',
      activities: 'Attività e Mansioni',
      inventory: 'Inventario',
      labels: 'Gestione Etichette',
      ai: 'IA Assistant',
      settings: 'Impostazioni e Dati',
      management: 'Gestione'
    },
    
    status: {
      active: 'Attivo',
      inactive: 'Inattivo',
      pending: 'In attesa',
      completed: 'Completato',
      failed: 'Fallito',
      cancelled: 'Annullato'
    }
  },

  // ============================================================================
  // MESSAGGI DI ERRORE
  // ============================================================================
  errors: {
    general: {
      unexpected: 'Errore imprevisto',
      network: 'Errore di rete',
      timeout: 'Timeout della richiesta',
      unauthorized: 'Non autorizzato',
      forbidden: 'Accesso negato',
      notFound: 'Risorsa non trovata',
      server: 'Errore del server',
      validation: 'Errore di validazione',
      unknown: 'Errore sconosciuto'
    },
    
    forms: {
      invalidData: 'Dati non validi',
      missingFields: 'Campi mancanti',
      validationFailed: 'Validazione fallita',
      submitFailed: 'Invio fallito',
      conflict: 'Conflitto di form'
    },
    
    data: {
      loadFailed: 'Caricamento dati fallito',
      saveFailed: 'Salvataggio dati fallito',
      deleteFailed: 'Eliminazione dati fallita',
      syncFailed: 'Sincronizzazione fallita',
      migrationFailed: 'Migrazione dati fallita'
    }
  },

  // ============================================================================
  // MESSAGGI EDUCATIVI
  // ============================================================================
  education: {
    haccp: {
      temperature: {
        importance: 'Le temperature corrette sono fondamentali per la sicurezza alimentare',
        monitoring: 'Monitora regolarmente le temperature per prevenire contaminazioni',
        range: 'Mantieni le temperature entro i range HACCP specificati',
        tolerance: 'Rispetta le tolleranze di temperatura per ogni tipo di prodotto'
      },
      
      categories: {
        selection: 'Seleziona solo categorie compatibili tra loro',
        maxLimit: 'Non superare il limite di 5 categorie per frigorifero',
        temperature: 'Considera i range di temperatura delle categorie selezionate'
      },
      
      maintenance: {
        importance: 'La manutenzione regolare previene guasti e contaminazioni',
        schedule: 'Rispetta il programma di manutenzione per ogni frigorifero',
        records: 'Mantieni registri dettagliati di tutte le manutenzioni'
      },
      
      compliance: {
        monitoring: 'Il monitoraggio continuo garantisce la compliance HACCP',
        alerts: 'Presta attenzione agli alert di temperatura e manutenzione',
        documentation: 'Documenta tutte le attività per le ispezioni'
      }
    },
    
    forms: {
      oneAtTime: 'Puoi aprire solo un form alla volta per evitare conflitti',
      draft: 'Le modifiche vengono salvate automaticamente come bozza',
      validation: 'La validazione in tempo reale previene errori di inserimento'
    }
  },

  // ============================================================================
  // MESSAGGI DI CONFERMA
  // ============================================================================
  confirmations: {
    delete: {
      refrigerator: 'Sei sicuro di voler eliminare questo frigorifero?',
      temperature: 'Sei sicuro di voler eliminare questa registrazione?',
      staff: 'Sei sicuro di voler eliminare questo membro dello staff?',
      inventory: 'Sei sicuro di voler eliminare questo prodotto?',
      department: 'Sei sicuro di voler eliminare questo reparto?',
      supplier: 'Sei sicuro di voler eliminare questo fornitore?'
    },
    
    save: {
      draft: 'Salvare le modifiche come bozza?',
      overwrite: 'Sovrascrivere i dati esistenti?',
      continue: 'Continuare senza salvare?'
    },
    
    form: {
      close: 'Chiudere il form senza salvare?',
      switch: 'Passare a un altro form? Le modifiche non salvate andranno perse.'
    }
  }
}
