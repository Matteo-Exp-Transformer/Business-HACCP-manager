/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo file gestisce il DATABASE DELLE TEMPERATURE - FUNZIONALITÀ CRITICA HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 */

import { parseSetTemperature } from './temperatureHelpers'

/**
 * ⚠️ Questo database gestisce allarmi e validazioni temperature critiche
 * ⚠️ Basato su normative EU/ASL vincolanti per la sicurezza alimentare
 * 
 * 📋 REGOLE OBBLIGATORIE: Segui sempre le REGOLE DI OTTIMIZZAZIONE in AGENT_DIRECTIVES.md
 * 
 * @fileoverview Database Temperature HACCP - Sistema Critico di Sicurezza
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Temperature e Allarmi
 * @version 1.0
 * @legal Reg. (CE) 853/2004, Direttiva 89/108/CEE, DPR 327/80
 */

// Database delle temperature normative EU/ASL per prodotti alimentari
// Basato su Reg. (CE) 853/2004, Direttiva 89/108/CEE, DPR 327/80 e normative ASL

export const FOOD_TEMPERATURE_DATABASE = [
  // CARNI
  {
    food_item: 'Carne fresca (bovino/suino/ovino)',
    conservation_category: 'refrigerated',
    temp_celsius: '2-7°C',
    temp_range: { min: 2, max: 7 },
    notes: 'Offal a 2-3°C; dopo ispezione va raffreddata',
    legal_reference: 'Reg. 853/2004, All. III, Sez. I, Cap. VII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Frattaglie (offal)',
    conservation_category: 'refrigerated',
    temp_celsius: '1-3°C',
    temp_range: { min: 1, max: 3 },
    notes: 'Applicare stesso schema trasporto/stoccaggio carni',
    legal_reference: 'Reg. 853/2004, All. III, Sez. I, Cap. VII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Carne di pollame fresca',
    conservation_category: 'refrigerated',
    temp_celsius: '2-4°C',
    temp_range: { min: 2, max: 4 },
    notes: 'Valore operativo coerente con requisiti per lavorazione/macinati',
    legal_reference: 'Reg. 853/2004, All. III, Sez. V, Cap. III',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Carni macinate (tutte)',
    conservation_category: 'refrigerated',
    temp_celsius: '0-2°C',
    temp_range: { min: 0, max: 2 },
    notes: 'Dopo produzione; mantenere in trasporto/stoccaggio',
    legal_reference: 'Reg. 853/2004, All. III, Sez. V, Cap. III',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Preparazioni di carne (non macinate)',
    conservation_category: 'refrigerated',
    temp_celsius: '2-4°C',
    temp_range: { min: 2, max: 4 },
    notes: 'Dopo produzione; mantenere in trasporto/stoccaggio',
    legal_reference: 'Reg. 853/2004, All. III, Sez. V, Cap. III',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Carni (tutte) – surgelate',
    conservation_category: 'frozen',
    temp_celsius: '-18°C',
    temp_range: { min: -18, max: -18 },
    notes: 'Non ricongelare dopo decongelamento',
    legal_reference: 'Direttiva 89/108/CEE (surgelati)',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=celex:31989L0108'
  },

  // PESCE E PRODOTTI DELLA PESCA
  {
    food_item: 'Pesce fresco',
    conservation_category: 'refrigerated',
    temp_celsius: '0-2°C',
    temp_range: { min: 0, max: 2 },
    notes: 'Vicina al ghiaccio in fusione; tenere separata l\'acqua di fusione',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII, Cap. VII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Prodotti della pesca surgelati',
    conservation_category: 'frozen',
    temp_celsius: '-18°C',
    temp_range: { min: -18, max: -18 },
    notes: 'Ammesse brevi fluttuazioni +3°C nel trasporto',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII, Cap. VII-VIII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Crostacei/molluschi cotti e refrigerati',
    conservation_category: 'refrigerated',
    temp_celsius: '0-2°C',
    temp_range: { min: 0, max: 2 },
    notes: 'Vicina al ghiaccio in fusione; raffreddare al più presto',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII, Cap. VII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Pesce per consumo crudo (sushi, marinati)',
    conservation_category: 'frozen',
    temp_celsius: '-20°C per ≥24h O -35°C per ≥15h',
    temp_range: { min: -35, max: -20 },
    notes: 'Trattamento di bonifica parassiti',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII, Cap. III, Parte D',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },

  // LATTE E OVOPRODOTTI
  {
    food_item: 'Latte crudo (accettazione in stabilimento)',
    conservation_category: 'refrigerated',
    temp_celsius: '2-6°C',
    temp_range: { min: 2, max: 6 },
    notes: 'Può restare >6°C se lavorato subito/entro 4h',
    legal_reference: 'Reg. 853/2004, All. III, Sez. IX, Cap. II',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Ovoprodotti (liquidi)',
    conservation_category: 'refrigerated',
    temp_celsius: '≤4',
    notes: 'Max 48h a 4°C prima della trasformazione, se non stabilizzati',
    legal_reference: 'Reg. 853/2004, All. III, Sez. X, Cap. II-III',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Uova in guscio',
    conservation_category: 'ambient',
    temp_celsius: 'temperatura idonea e costante',
    notes: 'Evitare sbalzi termici; proteggere da sole/odori',
    legal_reference: 'Reg. 853/2004, All. III, Sez. X, Cap. I',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },

  // PRODOTTI COTTI E HOT HOLDING
  {
    food_item: 'Piatti pronti caldi (hot holding)',
    conservation_category: 'hot-holding',
    temp_celsius: '60–65',
    notes: 'Servizio caldo: mantenere ≥+60°C',
    legal_reference: 'DPR 327/80 Art. 31 (riepiloghi ASL)',
    reference_link: 'https://sian.aulss9.veneto.it/Temperatura-di-conservazione'
  },
  {
    food_item: 'Alimenti facilmente deperibili (generico)',
    conservation_category: 'refrigerated',
    temp_celsius: '4',
    notes: 'Valore guida storico nazionale',
    legal_reference: 'DPR 327/80 Art. 32 (riepiloghi)',
    reference_link: 'https://www.istitutosurgelati.it/wp-content/uploads/2016/05/temperature-prodotti-alimentari.pdf'
  },

  // FRUTTA E VERDURA
  {
    food_item: 'Frutta e verdura (non RTE)',
    conservation_category: 'ambient',
    temp_celsius: 'secondo etichetta/merceologia',
    notes: 'Rispettare indicazioni del produttore',
    legal_reference: 'Reg. 852/2004 (principi generali + etichetta)',
    reference_link: 'https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2004:139:0001:0054:it:PDF'
  },
  {
    food_item: 'Insalate pronte al consumo (IV gamma)',
    conservation_category: 'refrigerated',
    temp_celsius: '4–5',
    notes: 'Spesso etichetta impone ≤5°C',
    legal_reference: 'Etichetta del produttore + prassi ASL',
    reference_link: 'https://www.frareg.com/it/newsqualita/temperatura-frigo-haccp-come-conservare-gli-alimenti/'
  },

  // SURGELATI
  {
    food_item: 'Prodotti surgelati (tutti)',
    conservation_category: 'frozen',
    temp_celsius: '-18',
    notes: 'Catena del freddo continua',
    legal_reference: 'Direttiva 89/108/CEE (surgelati)',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=celex:31989L0108'
  },

  // PRODOTTI SPECIFICI ITALIANI
  {
    food_item: 'Mozzarella di Bufala',
    conservation_category: 'refrigerated',
    temp_celsius: '4-5',
    notes: 'Formaggio fresco, mantenere umidità',
    legal_reference: 'Reg. 853/2004 + DPR 327/80',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Parmigiano Reggiano',
    conservation_category: 'ambient',
    temp_celsius: '15-18',
    notes: 'Formaggio stagionato, ambiente fresco e asciutto',
    legal_reference: 'Reg. 853/2004 + DPR 327/80',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Prosciutto Crudo',
    conservation_category: 'refrigerated',
    temp_celsius: '2-4',
    notes: 'Salume stagionato, evitare condensa',
    legal_reference: 'Reg. 853/2004 + DPR 327/80',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Salmone',
    conservation_category: 'refrigerated',
    temp_celsius: '0-2',
    notes: 'Pesce fresco, vicino al ghiaccio',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },

  // NUOVE CATEGORIE AGGIUNTE
  {
    food_item: 'Pesce Surgelato',
    conservation_category: 'frozen',
    temp_celsius: '-18',
    notes: 'Catena del freddo continua, non ricongelare',
    legal_reference: 'Direttiva 89/108/CEE (surgelati)',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/ALL/?uri=celex:31989L0108'
  },
  {
    food_item: 'Prodotti della pesca destinati al consumo crudo',
    conservation_category: 'frozen',
    temp_celsius: '-20 per ≥24h O -35 per ≥15h',
    notes: 'Trattamento di bonifica parassiti obbligatorio',
    legal_reference: 'Reg. 853/2004, All. III, Sez. VIII, Cap. III, Parte D',
    reference_link: 'https://eur-lex.europa.eu/legal-content/IT/TXT/PDF/?uri=CELEX:32004R0853'
  },
  {
    food_item: 'Insalate pronte al consumo (IV gamma)',
    conservation_category: 'refrigerated',
    temp_celsius: '4–5',
    notes: 'Spesso etichetta impone ≤5°C',
    legal_reference: 'Etichetta del produttore + prassi ASL',
    reference_link: 'https://www.frareg.com/it/newsqualita/temperatura-frigo-haccp-come-conservare-gli-alimenti/'
  },
  {
    food_item: 'Frutta e verdura (non RTE)',
    conservation_category: 'ambient',
    temp_celsius: 'secondo etichetta/merceologia',
    notes: 'Rispettare indicazioni del produttore',
    legal_reference: 'Reg. 852/2004 (principi generali + etichetta)',
    reference_link: 'https://eur-lex.europa.eu/LexUriServ/LexUriServ.do?uri=OJ:L:2004:139:0001:0054:it:PDF'
  }
]

// Funzione per cercare suggerimenti di conservazione per un prodotto
export const getConservationSuggestions = (productName) => {
  const normalizedName = productName.toLowerCase().trim()
  
  // Cerca corrispondenze esatte o parziali
  const matches = FOOD_TEMPERATURE_DATABASE.filter(item => {
    const itemWords = item.food_item.toLowerCase().split(' ')
    return item.food_item.toLowerCase().includes(normalizedName) ||
           normalizedName.includes(itemWords[0]) ||
           (itemWords[1] && normalizedName.includes(itemWords[1]))
  })

  // Se non trova corrispondenze dirette, cerca per categoria
  if (matches.length === 0) {
    // Mappatura categorie generiche
    const categoryMapping = {
      'latticini': ['latte', 'formaggio', 'mozzarella', 'parmigiano', 'ricotta'],
      'carni': ['carne', 'salume', 'prosciutto', 'salame', 'bresaola'],
      'pesce_fresco': ['pesce', 'salmone', 'branzino', 'vongole'],
      'pesce_surgelato': ['pesce surgelato', 'gamberi surgelati'],
      'surgelati': ['surgelato', 'gelato', 'spinaci surgelati'],
      'verdure': ['verdura', 'insalata', 'pomodoro', 'zucchina'],
      'frutta': ['frutta', 'mela', 'arancia', 'limone'],
      'ambiente': ['biscotti', 'crackers', 'pane', 'scatolame', 'pasta secca', 'riso', 'farina']
    }

    for (const [category, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => normalizedName.includes(keyword))) {
        // Trova prodotti simili nella categoria
        const similarProducts = FOOD_TEMPERATURE_DATABASE.filter(item => {
          const itemCategory = getProductCategory(item.food_item)
          return itemCategory === category
        })
        return similarProducts
      }
    }
  }

  return matches
}

// Funzione per determinare la categoria di un prodotto
export const getProductCategory = (foodItem) => {
  const item = foodItem.toLowerCase()
  
  if (item.includes('carne') || item.includes('salume') || item.includes('prosciutto')) return 'carni'
  if (item.includes('pesce') && item.includes('surgelato')) return 'pesce_surgelato'
  if (item.includes('pesce') || item.includes('vongole') || item.includes('molluschi')) return 'pesce_fresco'
  if (item.includes('surgelato') || item.includes('gelato')) return 'surgelati'
  if (item.includes('latte') || item.includes('formaggio') || item.includes('mozzarella')) return 'latticini'
  if (item.includes('verdura') || item.includes('insalata') || item.includes('pomodoro')) return 'verdure'
  if (item.includes('frutta') || item.includes('mela') || item.includes('arancia')) return 'frutta'
  if (item.includes('pasta') || item.includes('riso') || item.includes('farina')) return 'dispensa'
  if (item.includes('olio') || item.includes('aceto') || item.includes('spezie')) return 'condimenti'
  if (item.includes('biscotti') || item.includes('crackers') || item.includes('pane') || item.includes('scatolame')) return 'ambiente'
  
  return 'altro'
}

// Funzione per ottenere la temperatura ottimale per una categoria
export const getOptimalTemperature = (category) => {
  const tempRanges = {
    'latticini': { min: 4, max: 6, unit: '°C', type: 'refrigerated' },
    'carni': { min: 2, max: 4, unit: '°C', type: 'refrigerated' },
    'pesce_fresco': { min: 0, max: 2, unit: '°C', type: 'refrigerated' },
    'pesce_surgelato': { min: -18, max: -18, unit: '°C', type: 'frozen' },
    'surgelati': { min: -18, max: -18, unit: '°C', type: 'frozen' },
    'verdure': { min: 6, max: 8, unit: '°C', type: 'refrigerated' },
    'frutta': { min: 6, max: 8, unit: '°C', type: 'refrigerated' },
    'dispensa': { min: 15, max: 25, unit: '°C', type: 'ambient' },
    'condimenti': { min: 15, max: 25, unit: '°C', type: 'ambient' },
    'ambiente': { min: 15, max: 25, unit: '°C', type: 'ambient' }
  }
  
  return tempRanges[category] || { min: 4, max: 8, unit: '°C', type: 'refrigerated' }
}

// Funzione per suggerire il miglior punto di conservazione
export const suggestStorageLocation = (productName, availableRefrigerators) => {
  const suggestions = getConservationSuggestions(productName)
  if (suggestions.length === 0) return null
  
  const bestMatch = suggestions[0]
  const category = getProductCategory(bestMatch.food_item)
  const optimalTemp = getOptimalTemperature(category)
  
  // Trova il frigorifero più adatto
  let bestRefrigerator = null
  let bestScore = -1
  
  availableRefrigerators.forEach(ref => {
    // Usa parseSetTemperature per uniformare il modello temperatura
    const tempData = parseSetTemperature(ref)
    let refTemp = 0
    
    if (tempData.mode === 'fixed') {
      refTemp = tempData.value
    } else if (tempData.mode === 'range') {
      refTemp = (tempData.range.min + tempData.range.max) / 2
    } else if (tempData.mode === 'ambient') {
      refTemp = 20 // Temperatura media ambiente
    } else {
      return // Skip refrigerators with unknown temperature
    }
    
    let score = 0
    
    // Punteggio per temperatura
    if (optimalTemp.type === 'frozen' && refTemp <= -13.5) {
      score += 100 - Math.abs(refTemp - optimalTemp.min)
    } else if (optimalTemp.type === 'refrigerated' && refTemp >= -2.5 && refTemp <= 14) {
      score += 100 - Math.abs(refTemp - (optimalTemp.min + optimalTemp.max) / 2)
    } else if (optimalTemp.type === 'ambient' && refTemp >= 15 && refTemp <= 25) {
      score += 100 - Math.abs(refTemp - 20)
    }
    
    // Bonus per categoria specifica
    if (ref.dedicatedTo === category) {
      score += 50
    }
    
    if (score > bestScore) {
      bestScore = score
      bestRefrigerator = ref
    }
  })
  
  return {
    refrigerator: bestRefrigerator,
    suggestions: suggestions,
    optimalTemperature: optimalTemp,
    score: bestScore
  }
}
