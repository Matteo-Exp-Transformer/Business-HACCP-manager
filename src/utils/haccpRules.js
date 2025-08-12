/**
 * HACCP Rules - Regole centralizzate per validazione e controllo accessi
 * 
 * Questo file definisce:
 * 1. Regole di onboarding minimo
 * 2. Controlli di accesso alle sezioni
 * 3. Validazioni HACCP critiche
 * 4. Messaggi educativi per l'utente
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Controllo accessi e validazioni
 */

// Regole di onboarding minimo
export const ONBOARDING_RULES = {
  // Sequenza obbligatoria per attivare le funzionalità HACCP
  sequence: [
    {
      step: 'company',
      name: 'Azienda',
      description: 'Informazioni base dell\'azienda',
      required: true,
      whyMatters: 'Identifica l\'azienda per la tracciabilità HACCP e la compliance normativa'
    },
    {
      step: 'departments',
      name: 'Dipartimenti',
      description: 'Almeno 1 dipartimento',
      required: true,
      minCount: 1,
      whyMatters: 'Organizza la struttura operativa per la gestione dei processi HACCP'
    },
    {
      step: 'refrigerators',
      name: 'Punti di Conservazione',
      description: 'Almeno 1 frigorifero/freezer',
      required: true,
      minCount: 1,
      whyMatters: 'Controlla le temperature critiche per la sicurezza alimentare'
    },
    {
      step: 'staff',
      name: 'Personale',
      description: 'Almeno 1 membro dello staff',
      required: true,
      minCount: 1,
      whyMatters: 'Assicura la responsabilità e la formazione HACCP del personale'
    }
  ],
  
  // Step opzionali che migliorano la gestione
  optional: [
    {
      step: 'suppliers',
      name: 'Fornitori',
      description: 'Gestione fornitori e approvvigionamenti',
      whyMatters: 'Traccia la provenienza dei prodotti per la sicurezza alimentare'
    },
    {
      step: 'manual',
      name: 'Manuale HACCP',
      description: 'Consultazione guida operativa',
      whyMatters: 'Fornisce supporto per le procedure HACCP corrette'
    }
  ]
}

// Regole di accesso alle sezioni
export const SECTION_ACCESS_RULES = {
  // Sezioni sempre accessibili
  always: ['dashboard', 'data-settings'],
  
  // Sezioni con prerequisiti
  conditional: {
    'refrigerators': {
      requires: ['departments'],
      minCounts: { departments: 1 },
      message: 'Prima di gestire i punti di conservazione, devi creare almeno un dipartimento per organizzare la struttura operativa.',
      whyMatters: 'I dipartimenti organizzano le responsabilità e facilitano la gestione HACCP'
    },
    
    'cleaning': {
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per gestire le attività e mansioni, devi prima creare dipartimenti e punti di conservazione.',
      whyMatters: 'Le attività HACCP devono essere associate a strutture organizzative e punti di controllo'
    },
    
    'inventory': {
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per gestire l\'inventario, devi prima creare dipartimenti e punti di conservazione.',
      whyMatters: 'I prodotti devono essere assegnati a dipartimenti e conservati in punti controllati'
    },
    
    'labels': {
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per creare etichette prodotti, devi prima organizzare dipartimenti e punti di conservazione.',
      whyMatters: 'Le etichette devono tracciare la conservazione e la responsabilità HACCP'
    },
    
    'staff': {
      requires: ['departments'],
      minCounts: { departments: 1 },
      message: 'Per gestire il personale, devi prima creare i dipartimenti di riferimento.',
      whyMatters: 'Il personale deve essere assegnato a dipartimenti per la responsabilità HACCP'
    }
  }
}

// Regole di validazione HACCP
export const HACCP_VALIDATION_RULES = {
  // Temperature critiche
  temperature: {
    positive: {
      min: 0,
      max: 8,
      critical: { min: 2, max: 6 },
      whyMatters: 'Temperature tra 2-6°C garantiscono la sicurezza di latticini, salumi e verdure'
    },
    negative: {
      min: -20,
      max: -18,
      critical: { min: -19, max: -17 },
      whyMatters: 'Temperature tra -19 e -17°C mantengono la qualità dei surgelati'
    },
    hot: {
      min: 60,
      max: 65,
      critical: { min: 63, max: 65 },
      whyMatters: 'Temperature sopra 63°C prevengono la proliferazione batterica'
    }
  },
  
  // Scadenze prodotti
  expiry: {
    warningDays: 3,
    criticalDays: 1,
    whyMatters: 'Il controllo delle scadenze previene l\'uso di prodotti non sicuri'
  },
  
  // Frequenza controlli
  frequency: {
    temperature: '2 volte al giorno',
    cleaning: 'Dopo ogni uso',
    maintenance: 'Settimanale',
    whyMatters: 'La frequenza dei controlli garantisce la continuità della sicurezza alimentare'
  }
}

// Funzione per verificare se una sezione è accessibile
export const checkSectionAccess = (section, data) => {
  // Sezioni sempre accessibili
  if (SECTION_ACCESS_RULES.always.includes(section)) {
    return {
      isEnabled: true,
      requirements: [],
      message: null
    }
  }
  
  // Controlla regole condizionali
  const rule = SECTION_ACCESS_RULES.conditional[section]
  if (!rule) {
    return {
      isEnabled: true,
      requirements: [],
      message: null
    }
  }
  
  // Verifica prerequisiti
  const missingRequirements = []
  const unmetCounts = []
  
  rule.requires.forEach(req => {
    const dataKey = req === 'refrigerators' ? 'refrigerators' : req
    const items = data[dataKey] || []
    
    if (items.length === 0) {
      missingRequirements.push(req)
    } else if (rule.minCounts && rule.minCounts[req]) {
      const minCount = rule.minCounts[req]
      if (items.length < minCount) {
        unmetCounts.push({ requirement: req, current: items.length, required: minCount })
      }
    }
  })
  
  const isEnabled = missingRequirements.length === 0 && unmetCounts.length === 0
  
  return {
    isEnabled,
    requirements: rule.requires,
    message: isEnabled ? null : rule.message,
    missingRequirements,
    unmetCounts,
    whyMatters: rule.whyMatters
  }
}

// Funzione per verificare lo stato di onboarding
export const checkOnboardingStatus = (data) => {
  const completedSteps = []
  const missingSteps = []
  let progress = 0
  
  ONBOARDING_RULES.sequence.forEach((step, index) => {
    const dataKey = step.step === 'company' ? 'company' : 
                   step.step === 'departments' ? 'departments' :
                   step.step === 'refrigerators' ? 'refrigerators' :
                   step.step === 'staff' ? 'staff' : step.step
    
    let isCompleted = false
    
    if (step.step === 'company') {
      // Verifica se esiste almeno un utente (indica azienda configurata)
      isCompleted = (data.users && data.users.length > 0)
    } else if (step.minCount) {
      const items = data[dataKey] || []
      isCompleted = items.length >= step.minCount
    } else {
      isCompleted = !!(data[dataKey] && data[dataKey].length > 0)
    }
    
    if (isCompleted) {
      completedSteps.push(step.step)
      progress += 100 / ONBOARDING_RULES.sequence.length
    } else {
      missingSteps.push(step)
    }
  })
  
  return {
    completedSteps,
    missingSteps,
    progress: Math.round(progress),
    isComplete: progress >= 100,
    nextStep: missingSteps[0] || null
  }
}

// Funzione per ottenere messaggi di validazione
export const getValidationMessage = (type, value, context = {}) => {
  const rules = HACCP_VALIDATION_RULES[type]
  if (!rules) return null
  
  if (type === 'temperature') {
    const temp = parseFloat(value)
    if (isNaN(temp)) return 'Inserisci una temperatura valida'
    
    // Determina il tipo di refrigerazione dal contesto
    const isFreezer = context.isFreezer || temp < 0
    const isHot = context.isHot || temp > 50
    
    if (isFreezer) {
      if (temp < rules.negative.min || temp > rules.negative.max) {
        return `Temperature freezer critiche: ${rules.negative.min}°C a ${rules.negative.max}°C. ${rules.negative.whyMatters}`
      }
    } else if (isHot) {
      if (temp < rules.hot.min) {
        return `Temperature calde critiche: minimo ${rules.hot.min}°C. ${rules.hot.whyMatters}`
      }
    } else {
      if (temp < rules.positive.min || temp > rules.positive.max) {
        return `Temperature positive critiche: ${rules.positive.min}°C a ${rules.positive.max}°C. ${rules.positive.whyMatters}`
      }
    }
  }
  
  return null
}

export default {
  ONBOARDING_RULES,
  SECTION_ACCESS_RULES,
  HACCP_VALIDATION_RULES,
  checkSectionAccess,
  checkOnboardingStatus,
  getValidationMessage
}
