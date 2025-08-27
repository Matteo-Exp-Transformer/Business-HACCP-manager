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
// Note: i nomi delle sezioni sono mantenuti per compatibilità interna
// UI mostra: Home, Punti di Conservazione, Attività e Mansioni, Inventario, Gestione Etichette, IA Assistant, Impostazioni e Dati, Gestione
export const SECTION_ACCESS_RULES = {
  // Sezioni sempre accessibili
  always: ['dashboard', 'data-settings'],  // ex Dashboard → Home, ex DataSettings → Impostazioni e Dati
  
  // Sezioni con prerequisiti
  conditional: {
    'refrigerators': {  // ex Frigoriferi → Punti di Conservazione
      requires: ['departments'],
      minCounts: { departments: 1 },
      message: 'Prima di gestire i punti di conservazione, devi creare almeno un dipartimento per organizzare la struttura operativa.',
      whyMatters: 'I dipartimenti organizzano le responsabilità e facilitano la gestione HACCP'
    },
    
    'cleaning': {  // ex Cleaning → Attività e Mansioni
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per gestire le attività e mansioni, devi prima creare dipartimenti e punti di conservazione.',
      whyMatters: 'Le attività HACCP devono essere associate a strutture organizzative e punti di controllo'
    },
    
    'inventory': {  // ex Inventory → Inventario
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per gestire l\'inventario, devi prima creare dipartimenti e punti di conservazione.',
      whyMatters: 'I prodotti devono essere assegnati a dipartimenti e conservati in punti controllati'
    },
    
    'labels': {  // ex ProductLabels → Gestione Etichette
      requires: ['departments', 'refrigerators'],
      minCounts: { departments: 1, refrigerators: 1 },
      message: 'Per creare etichette prodotti, devi prima organizzare dipartimenti e punti di conservazione.',
      whyMatters: 'Le etichette devono tracciare la conservazione e la responsabilità HACCP'
    },
    
    'staff': {  // ex Staff → Gestione
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

// Database delle temperature HACCP secondo normative UE e linee guida italiane
const HACCP_TEMPERATURE_DATABASE = {
  latticini: {
    name: 'Latticini e Formaggi',
    ranges: [
      { type: 'freschi', min: 0, max: 4, description: 'Prodotti freschi (latte, yogurt, formaggi freschi)' },
      { type: 'stagionati', min: 4, max: 8, description: 'Formaggi stagionati e semi-stagionati' }
    ],
    normative: 'Reg. CE 853/2004: latte crudo ≤ +6 °C, prodotti lattiero-caseari freschi ≤ +4 °C',
    notes: 'Conservare separati da carni/pesce; evitare contatto con aria calda in frigo',
    warningThreshold: 2, // Warning per differenze fino a 2°C
    errorThreshold: 2    // Errore per differenze >2°C
  },
  carni: {
    name: 'Carni e Salumi (freschi)',
    ranges: [
      { type: 'generali', min: 0, max: 4, description: 'Carni fresche generiche' },
      { type: 'pollo', min: 0, max: 4, description: 'Pollame e carni avicole' },
      { type: 'tritata', min: 0, max: 2, description: 'Carne tritata e macinata' }
    ],
    normative: 'Reg. CE 853/2004: carni fresche ≤ +7 °C; pollame ≤ +4 °C; carne tritata ≤ +2 °C',
    notes: 'Conservare separati da prodotti già cotti; tracciabilità lotti obbligatoria',
    warningThreshold: 2,
    errorThreshold: 2
  },
  verdure: {
    name: 'Verdure e Ortaggi',
    ranges: [
      { type: 'generali', min: 4, max: 8, description: 'Verdure fresche e ortaggi' }
    ],
    normative: 'Linee guida HACCP nazionali: refrigerati per rallentare carica microbica',
    notes: 'Lavare prima dell\'uso, no contatto con crudi di origine animale',
    warningThreshold: 2,
    errorThreshold: 2
  },
  frutta: {
    name: 'Frutta fresca',
    ranges: [
      { type: 'generali', min: 4, max: 8, description: 'Frutta fresca generica' },
      { type: 'tropicale', min: 12, max: 16, description: 'Frutta tropicale (banane, avocado, mango)' }
    ],
    normative: 'Non esistono limiti rigidi UE, ma linee guida HACCP → refrigerazione raccomandata',
    notes: 'Alcuni frutti tropicali (banane, avocado) meglio a +12 ÷ +16 °C',
    warningThreshold: 2,
    errorThreshold: 2
  },
  pesce: {
    name: 'Pesce fresco',
    ranges: [
      { type: 'fresco', min: 0, max: 2, description: 'Pesce fresco (sopra ghiaccio fuso)' }
    ],
    normative: 'Reg. CE 853/2004: obbligo conservazione a temperatura di fusione del ghiaccio (0-2 °C)',
    notes: 'Tenere sempre sopra ghiaccio; consumare in tempi brevi',
    warningThreshold: 1, // Più restrittivo per il pesce
    errorThreshold: 1
  },
  surgelati: {
    name: 'Surgelati (gelati, prodotti pronti)',
    ranges: [
      { type: 'generali', min: -18, max: -18, description: 'Prodotti surgelati' }
    ],
    normative: 'Reg. CE 853/2004 + DPR 283/1962: surgelati ≤ –18 °C, max oscillazioni –15 °C in vendita',
    notes: 'Controllo temperatura continuo; allarmi freezer raccomandati',
    warningThreshold: 3, // Come specificato nel documento
    errorThreshold: 3
  },
  dispensa: {
    name: 'Dispensa secca (pasta, riso, farine, conserve)',
    ranges: [
      { type: 'generali', min: 14, max: 20, description: 'Prodotti secchi e conserve' }
    ],
    normative: 'Nessun vincolo normativo diretto (prodotti stabili)',
    notes: 'Proteggere da umidità, insetti e luce solare diretta',
    warningThreshold: 3,
    errorThreshold: 3
  },
  condimenti: {
    name: 'Oli e Condimenti',
    ranges: [
      { type: 'generali', min: 14, max: 18, description: 'Oli, aceti, spezie, salse' }
    ],
    normative: 'Linee guida HACCP: conservare al riparo da calore e luce',
    notes: 'Non refrigerare oli extravergine (rischio cristallizzazione)',
    warningThreshold: 3,
    errorThreshold: 3
  },
  hot_holding: {
    name: 'Mantenimento caldo',
    ranges: [
      { type: 'generali', min: 60, max: 60, description: 'Alimenti pronti mantenuti caldi' }
    ],
    normative: 'Reg. CE 852/2004 + Ministero Salute: alimenti pronti mantenuti ≥ +60 °C fino al consumo',
    notes: 'Non superare 2 ore di mantenimento continuativo',
    warningThreshold: 2,
    errorThreshold: 2
  },
  ambiente: {
    name: 'Temperatura ambiente (pane, prodotti da forno, frutta secca)',
    ranges: [
      { type: 'generali', min: 18, max: 25, description: 'Prodotti conservati a temperatura ambiente' }
    ],
    normative: 'Linee guida HACCP: conservazione in locali areati e puliti',
    notes: 'Separare da fonti di umidità e calore',
    warningThreshold: 3,
    errorThreshold: 3
  }
}

// Funzione per validare le temperature di un punto di conservazione
export function validateStoragePointTemperature(category, minTemp, maxTemp) {
  const categoryData = HACCP_TEMPERATURE_DATABASE[category]
  
  if (!categoryData) {
    return {
      isValid: false,
      type: 'error',
      message: `Categoria "${category}" non riconosciuta per la validazione HACCP`
    }
  }

  // Calcola la temperatura media impostata
  const avgTemp = (minTemp + maxTemp) / 2
  
  // Trova il range più appropriato per la categoria
  let bestRange = categoryData.ranges[0]
  let minDeviation = Infinity
  
  for (const range of categoryData.ranges) {
    const rangeAvg = (range.min + range.max) / 2
    const deviation = Math.abs(avgTemp - rangeAvg)
    
    if (deviation < minDeviation) {
      minDeviation = deviation
      bestRange = range
    }
  }

  // Calcola le deviazioni dai limiti
  const deviationFromMin = bestRange.min - minTemp
  const deviationFromMax = maxTemp - bestRange.max
  
  // Determina il tipo di validazione
  let validationResult = {
    isValid: true,
    type: 'success',
    message: `Temperature conformi alle normative HACCP per ${categoryData.name}`,
    category: categoryData.name,
    normative: categoryData.normative,
    notes: categoryData.notes,
    recommendedRange: `${bestRange.min}°C ÷ ${bestRange.max}°C`,
    currentRange: `${minTemp}°C ÷ ${maxTemp}°C`
  }

  // Controlla se è fuori range
  if (minTemp < bestRange.min || maxTemp > bestRange.max) {
    const maxDeviation = Math.max(deviationFromMin, deviationFromMax)
    
    if (maxDeviation <= categoryData.warningThreshold) {
      // Warning: temperatura leggermente fuori range
      validationResult = {
        isValid: true, // Permette di continuare
        type: 'warning',
        message: `⚠️ Attenzione: Temperature leggermente fuori range HACCP per ${categoryData.name}`,
        category: categoryData.name,
        normative: categoryData.normative,
        notes: categoryData.notes,
        recommendedRange: `${bestRange.min}°C ÷ ${bestRange.max}°C`,
        currentRange: `${minTemp}°C ÷ ${maxTemp}°C`,
        deviation: maxDeviation,
        suggestion: `Considera di regolare le temperature tra ${bestRange.min}°C e ${bestRange.max}°C per piena conformità HACCP`
      }
    } else {
      // Errore: temperatura significativamente fuori range
      validationResult = {
        isValid: false, // Blocca il salvataggio
        type: 'error',
        message: `❌ Errore: Temperature non conformi alle normative HACCP per ${categoryData.name}`,
        category: categoryData.name,
        normative: categoryData.normative,
        notes: categoryData.notes,
        recommendedRange: `${bestRange.min}°C ÷ ${bestRange.max}°C`,
        currentRange: `${minTemp}°C ÷ ${maxTemp}°C`,
        deviation: maxDeviation,
        action: 'Correzione necessaria: regola le temperature per rispettare i limiti HACCP'
      }
    }
  }

  return validationResult
}

// Funzione per ottenere le linee guida HACCP per una categoria
export function getHaccpGuidelines(category) {
  const categoryData = HACCP_TEMPERATURE_DATABASE[category]
  
  if (!categoryData) {
    return null
  }

  return {
    name: categoryData.name,
    ranges: categoryData.ranges,
    normative: categoryData.normative,
    notes: categoryData.notes,
    warningThreshold: categoryData.warningThreshold,
    errorThreshold: categoryData.errorThreshold
  }
}

// Funzione per ottenere tutte le linee guida HACCP
export function getAllHaccpGuidelines() {
  return HACCP_TEMPERATURE_DATABASE
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
      // Per freezer, controlla se è nel range -20°C a -18°C
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
  getValidationMessage,
  validateStoragePointTemperature,
  getHaccpGuidelines,
  getAllHaccpGuidelines
}
