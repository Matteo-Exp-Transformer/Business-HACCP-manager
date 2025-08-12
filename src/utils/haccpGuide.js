/**
 * HACCP Guide - Guida completa per normative HACCP
 * 
 * Questo file contiene:
 * 1. Principi di base HACCP (per sviluppo)
 * 2. Linee guida operative (per utente)
 * 3. Requisiti minimi e dati obbligatori (per validazioni)
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Riferimento normativo
 * @source Normative HACCP vigenti
 */

export const HACCP_GUIDE = {
  version: "2.0",
  lastUpdated: "2024-12-19",
  
  // 1. PRINCIPI DI BASE HACCP (per sviluppo)
  principles: [
    {
      id: "data-collection",
      title: "Raccolta Dati Pertinenti",
      description: "Raccogliere dati pertinenti (temperature, pulizie, controlli, fornitori, prodotti) in formato tracciabile",
      critical: true,
      implementation: "Ogni funzione deve salvare timestamp, operatore e dati completi"
    },
    {
      id: "data-archiving",
      title: "Archiviazione 12 Mesi",
      description: "Archiviare i dati per almeno 12 mesi in formato esportabile (PDF o JSON) leggibile da terzi (ASL, NAS, auditor)",
      critical: true,
      implementation: "Sistema di backup automatico e export manuale"
    },
    {
      id: "data-integrity",
      title: "Integrità Dati",
      description: "Garantire integrità dei dati (nessuna modifica senza tracciamento, log azioni con data e ora)",
      critical: true,
      implementation: "Log di tutte le modifiche con timestamp e operatore"
    },
    {
      id: "prerequisites",
      title: "Prerequisiti Normativi",
      description: "Facilitare il rispetto dei prerequisiti normativi: igiene personale, controllo infestanti, manutenzione impianti, formazione personale",
      critical: true,
      implementation: "Checklist e promemoria per prerequisiti"
    },
    {
      id: "ccp-management",
      title: "Gestione CCP",
      description: "Gestire i CCP (Critical Control Points) con controlli programmati e azioni correttive",
      critical: true,
      implementation: "Sistema di allarmi e azioni correttive automatiche"
    }
  ],

  // 2. LINEE GUIDA OPERATIVE (per utente)
  guidelines: {
    temperature: {
      id: "temperature-control",
      title: "Registrazione Temperature",
      frequency: "Almeno 2 volte al giorno (inizio e metà turno)",
      criticalPoints: [
        {
          name: "Frigorifero positivo",
          range: { min: 0, max: 4, unit: "°C" },
          description: "Latticini, formaggi freschi, salumi"
        },
        {
          name: "Banco ingredienti",
          range: { min: 0, max: 8, unit: "°C" },
          description: "Pomodoro, mozzarella, verdure fresche"
        },
        {
          name: "Freezer",
          range: { min: -18, max: null, unit: "°C" },
          description: "Surgelati e prodotti congelati"
        }
      ],
      correctiveActions: [
        "Isolare prodotto e segnalarlo immediatamente",
        "Riparare/controllare apparecchio",
        "Registrare azione correttiva e prodotto isolato",
        "Verificare temperatura prima di riutilizzare"
      ],
      whyMatters: "Le temperature fuori range favoriscono la proliferazione batterica e compromettono la sicurezza alimentare"
    },

    cleaning: {
      id: "cleaning-sanitization",
      title: "Pulizie e Sanificazioni",
      zones: [
        {
          name: "Superfici di lavoro",
          frequency: "Dopo ogni uso",
          products: ["Detergente neutro", "Disinfettante alimentare"]
        },
        {
          name: "Celle e frigoriferi",
          frequency: "Settimanale",
          products: ["Detergente specifico", "Disinfettante alimentare"]
        },
        {
          name: "Pavimenti",
          frequency: "Quotidiano",
          products: ["Detergente pavimenti", "Disinfettante"]
        },
        {
          name: "Attrezzature",
          frequency: "Secondo manuale tecnico",
          products: ["Detergente specifico per attrezzature"]
        }
      ],
      recording: "Indicare operatore, orario, detergente/disinfettante usato",
      whyMatters: "La pulizia regolare previene contaminazioni e mantiene standard igienici"
    },

    staff: {
      id: "staff-management",
      title: "Gestione Personale",
      roles: [
        {
          name: "Amministratore",
          level: 1,
          responsibilities: ["Gestione completa sistema", "Responsabilità legale", "Approvazione procedure"]
        },
        {
          name: "Responsabile",
          level: 2,
          responsibilities: ["Supervisione operativa", "Controllo procedure", "Formazione staff"]
        },
        {
          name: "Dipendente",
          level: 3,
          responsibilities: ["Esecuzione procedure", "Registrazione dati", "Segnalazione problemi"]
        },
        {
          name: "Collaboratore occasionale",
          level: 4,
          responsibilities: ["Esecuzione procedure base", "Seguire istruzioni responsabile"]
        }
      ],
      requirements: [
        "Mansioni assegnate e documentate",
        "Formazione HACCP registrata e aggiornata",
        "Conoscenza procedure operative",
        "Responsabilità chiare per ogni ruolo"
      ],
      whyMatters: "Personale formato e responsabilizzato garantisce applicazione corretta delle procedure HACCP"
    },

    products: {
      id: "product-management",
      title: "Gestione Prodotti",
      scheda: [
        "Nome commerciale e nome scientifico",
        "Categoria (carne, latticini, verdure, ecc.)",
        "Data di ricezione e scadenza",
        "Fornitore e documentazione",
        "Etichetta interna se necessario (es. preparazioni interne con TMC)",
        "Condizioni di conservazione",
        "Allergeni presenti"
      ],
      whyMatters: "Tracciabilità completa garantisce sicurezza e conformità normativa"
    },

    suppliers: {
      id: "supplier-management",
      title: "Gestione Fornitori",
      registration: [
        "Nome e categoria merceologica",
        "Contatti e documentazione",
        "DDT/fatture con data di consegna",
        "Valutazione periodica affidabilità",
        "Controllo documenti di trasporto",
        "Verifica certificazioni HACCP"
      ],
      whyMatters: "Fornitori qualificati garantiscono materie prime sicure e conformi"
    },

    nonConformity: {
      id: "non-conformity",
      title: "Gestione Non Conformità",
      recording: [
        "Data e ora del rilevamento",
        "Descrizione dettagliata del problema",
        "Azione correttiva intrapresa",
        "Responsabile dell'azione",
        "Verifica efficacia azione correttiva",
        "Prevenzione ricorrenza"
      ],
      examples: [
        "Temperatura fuori range per più di 2 ore",
        "Presenza infestanti in magazzino",
        "Prodotto scaduto in vendita",
        "Dispositivo di controllo non funzionante",
        "Personale non formato per mansione"
      ],
      whyMatters: "Gestione corretta delle non conformità previene rischi e migliora il sistema"
    }
  },

  // 3. REQUISITI MINIMI E DATI OBBLIGATORI (per validazioni)
  requirements: {
    refrigerators: {
      mandatory: ["nome", "tipo", "range-temperatura", "posizione"],
      validation: "Minimo 1 registrato per sbloccare registrazione temperature",
      blocking: ["temperatures"],
      whyMatters: "I frigoriferi sono punti di controllo critici per la catena del freddo"
    },

    temperature: {
      mandatory: ["punto-controllo", "valore", "ora", "operatore"],
      validation: "Se valore fuori range → mostra alert e richiede azione correttiva",
      blocking: [],
      whyMatters: "Le temperature fuori range compromettono la sicurezza alimentare"
    },

    staff: {
      mandatory: ["nome", "ruolo", "mansioni", "formazione-haccp"],
      validation: "Minimo 1 per sbloccare pulizie e controlli",
      blocking: ["cleaning", "inventory"],
      whyMatters: "Il personale formato è responsabile dell'applicazione delle procedure"
    },

    cleaning: {
      mandatory: ["area", "frequenza", "prodotto-usato", "operatore", "data-ora"],
      validation: "Blocco se area non associata a un reparto",
      blocking: [],
      whyMatters: "Le pulizie regolari prevengono contaminazioni"
    },

    products: {
      mandatory: ["nome", "categoria", "data-ricezione", "scadenza", "fornitore"],
      validation: "Alert se scadenza imminente (<3 giorni)",
      blocking: [],
      whyMatters: "La tracciabilità garantisce sicurezza e conformità"
    },

    suppliers: {
      mandatory: ["nome", "categoria", "contatto", "documentazione"],
      validation: "Minimo 1 per associare prodotti",
      blocking: ["products"],
      whyMatters: "I fornitori qualificati garantiscono materie prime sicure"
    },

    nonConformity: {
      mandatory: ["data", "descrizione", "azione-correttiva", "responsabile"],
      validation: "Blocco salvataggio se mancano dettagli essenziali",
      blocking: [],
      whyMatters: "La gestione delle non conformità previene rischi futuri"
    }
  },

  // 4. MESSAGGI EDUCATIVI PER UTENTI
  educationalMessages: {
    welcome: "Benvenuto nel sistema HACCP! Questo sistema ti guiderà nella gestione della sicurezza alimentare.",
    whyHaccp: "L'HACCP è un sistema preventivo richiesto per legge che garantisce la sicurezza alimentare.",
    dataImportance: "Ogni dato registrato contribuisce alla sicurezza e alla conformità normativa.",
    responsibility: "La sicurezza alimentare è responsabilità di tutti i membri dello staff."
  },

  // 5. FUNZIONI UTILITY
  getRequirement: (section) => {
    return HACCP_GUIDE.requirements[section] || null
  },

  getGuideline: (section) => {
    return HACCP_GUIDE.guidelines[section] || null
  },

  getPrinciple: (id) => {
    return HACCP_GUIDE.principles.find(p => p.id === id) || null
  },

  validateRequirement: (section, data) => {
    const requirement = HACCP_GUIDE.getRequirement(section)
    if (!requirement) return { valid: false, error: "Sezione non trovata" }

    const missing = requirement.mandatory.filter(field => !data[field])
    return {
      valid: missing.length === 0,
      missing,
      message: missing.length > 0 ? `Campi mancanti: ${missing.join(', ')}` : "Tutti i campi obbligatori sono compilati"
    }
  },

  getBlockingSections: (section) => {
    const requirement = HACCP_GUIDE.getRequirement(section)
    return requirement ? requirement.blocking : []
  },

  isSectionBlocked: (section, appState) => {
    const requirement = HACCP_GUIDE.getRequirement(section)
    if (!requirement) return false

    // Controlla se i prerequisiti sono soddisfatti
    switch (section) {
      case 'temperatures':
        return !appState.refrigerators || appState.refrigerators.length === 0
      case 'cleaning':
        return (!appState.refrigerators || appState.refrigerators.length === 0) ||
               (!appState.staff || appState.staff.length === 0)
      case 'inventory':
        return (!appState.departments || appState.departments.length === 0) ||
               (!appState.refrigerators || appState.refrigerators.length === 0)
      case 'products':
        return (!appState.suppliers || appState.suppliers.length === 0)
      default:
        return false
    }
  }
}

export default HACCP_GUIDE
