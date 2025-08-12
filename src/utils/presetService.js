/**
 * Preset Service - Applicazione preset attività
 * 
 * Questo servizio gestisce l'applicazione dei preset predefiniti:
 * - Pizzeria: crea frigoriferi A/B, dipartimenti e ruoli specifici
 * - Bar: crea frigoriferi A/B, dipartimenti e ruoli specifici
 * 
 * @version 1.0
 * @critical Onboarding - Configurazione automatica
 */

// Schema frigorifero con validazione categorie
const REFRIGERATOR_SCHEMA = {
  id: '',
  name: '',
  tempMin: 0,
  tempMax: 0,
  allowedCategories: [],
  shelfMap: {},
  notes: '',
  createdAt: '',
  updatedAt: ''
}

// Preset configurazioni
const PRESET_CONFIGS = {
  pizzeria: {
    refrigerators: [
      {
        name: 'Frigo A',
        tempMin: 2,
        tempMax: 4,
        allowedCategories: ['Verdure', 'Salumi', 'Formaggi', 'Latticini'],
        notes: 'Frigorifero per prodotti freschi - temperatura critica per sicurezza alimentare',
        shelfMap: {
          'Shelf 1': 'Verdure (2-4°C)',
          'Shelf 2': 'Salumi (2-4°C)',
          'Shelf 3': 'Formaggi (2-4°C)',
          'Shelf 4': 'Latticini (2-4°C)'
        }
      },
      {
        name: 'Frigo B',
        tempMin: -19,
        tempMax: -16,
        allowedCategories: ['Surgelati'],
        notes: 'Freezer per surgelati - temperatura critica per mantenere qualità',
        shelfMap: {
          'Shelf 1': 'Surgelati (-19 a -16°C)',
          'Shelf 2': 'Surgelati (-19 a -16°C)',
          'Shelf 3': 'Surgelati (-19 a -16°C)'
        }
      }
    ],
    departments: [
      {
        name: 'Cucina',
        description: 'Preparazione piatti e gestione ingredienti',
        responsibilities: ['Controllo temperature', 'Gestione scadenze', 'Pulizia superfici']
      },
      {
        name: 'Pizzeria',
        description: 'Preparazione pizze e impasti',
        responsibilities: ['Controllo temperature', 'Gestione lievitazione', 'Pulizia attrezzature']
      }
    ],
    staff: [
      {
        name: 'Pizzaiolo',
        role: 'dipendente',
        department: 'Pizzeria',
        responsibilities: ['Preparazione pizze', 'Controllo temperature', 'Pulizia attrezzature']
      },
      {
        name: 'Cameriere',
        role: 'dipendente',
        department: 'Cucina',
        responsibilities: ['Servizio al tavolo', 'Controllo temperature', 'Pulizia superfici']
      },
      {
        name: 'Cassiere',
        role: 'dipendente',
        department: 'Cucina',
        responsibilities: ['Gestione cassa', 'Controllo scadenze', 'Pulizia area cassa']
      }
    ]
  },
  bar: {
    refrigerators: [
      {
        name: 'Frigo A',
        tempMin: 2,
        tempMax: 4,
        allowedCategories: ['Latticini'],
        notes: 'Frigorifero per latticini - temperatura critica per sicurezza alimentare',
        shelfMap: {
          'Shelf 1': 'Latticini (2-4°C)',
          'Shelf 2': 'Latticini (2-4°C)',
          'Shelf 3': 'Latticini (2-4°C)'
        }
      },
      {
        name: 'Frigo B',
        tempMin: -19,
        tempMax: -16,
        allowedCategories: ['Surgelati'],
        notes: 'Freezer per surgelati - temperatura critica per mantenere qualità',
        shelfMap: {
          'Shelf 1': 'Surgelati (-19 a -16°C)',
          'Shelf 2': 'Surgelati (-19 a -16°C)',
          'Shelf 3': 'Surgelati (-19 a -16°C)'
        }
      }
    ],
    departments: [
      {
        name: 'Banco Bar',
        description: 'Preparazione bevande e servizio clienti',
        responsibilities: ['Controllo temperature', 'Gestione scadenze', 'Pulizia banco']
      },
      {
        name: 'Magazzino',
        description: 'Gestione scorte e approvvigionamenti',
        responsibilities: ['Controllo temperature', 'Gestione scadenze', 'Pulizia magazzino']
      }
    ],
    staff: [
      {
        name: 'Cameriere',
        role: 'dipendente',
        department: 'Banco Bar',
        responsibilities: ['Servizio clienti', 'Controllo temperature', 'Pulizia banco']
      },
      {
        name: 'Cassiere',
        role: 'dipendente',
        department: 'Banco Bar',
        responsibilities: ['Gestione cassa', 'Controllo scadenze', 'Pulizia area cassa']
      }
    ]
  }
}

/**
 * Applica un preset specifico
 * @param {string} presetKey - Chiave del preset ('pizzeria' o 'bar')
 * @returns {Object} Risultato dell'applicazione
 */
export const applyPreset = (presetKey) => {
  try {
    const preset = PRESET_CONFIGS[presetKey]
    if (!preset) {
      throw new Error(`Preset '${presetKey}' non trovato`)
    }

    const result = {
      success: true,
      preset: presetKey,
      created: {
        refrigerators: 0,
        departments: 0,
        staff: 0
      },
      errors: []
    }

    // Applica frigoriferi
    try {
      const existingRefrigerators = JSON.parse(localStorage.getItem('haccp-refrigerators') || '[]')
      const newRefrigerators = []
      
      preset.refrigerators.forEach((fridgeConfig, index) => {
        const existingFridge = existingRefrigerators.find(f => f.name === fridgeConfig.name)
        
        if (!existingFridge) {
          const newFridge = {
            ...REFRIGERATOR_SCHEMA,
            id: `fridge_${presetKey}_${index + 1}_${Date.now()}`,
            ...fridgeConfig,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          newRefrigerators.push(newFridge)
          result.created.refrigerators++
        }
      })
      
      if (newRefrigerators.length > 0) {
        const allRefrigerators = [...existingRefrigerators, ...newRefrigerators]
        localStorage.setItem('haccp-refrigerators', JSON.stringify(allRefrigerators))
      }
    } catch (error) {
      result.errors.push(`Errore frigoriferi: ${error.message}`)
    }

    // Applica dipartimenti
    try {
      const existingDepartments = JSON.parse(localStorage.getItem('haccp-departments') || '[]')
      const newDepartments = []
      
      preset.departments.forEach((deptConfig, index) => {
        const existingDept = existingDepartments.find(d => d.name === deptConfig.name)
        
        if (!existingDept) {
          const newDept = {
            id: `dept_${presetKey}_${index + 1}_${Date.now()}`,
            ...deptConfig,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          newDepartments.push(newDept)
          result.created.departments++
        }
      })
      
      if (newDepartments.length > 0) {
        const allDepartments = [...existingDepartments, ...newDepartments]
        localStorage.setItem('haccp-departments', JSON.stringify(allDepartments))
      }
    } catch (error) {
      result.errors.push(`Errore dipartimenti: ${error.message}`)
    }

    // Applica staff
    try {
      const existingStaff = JSON.parse(localStorage.getItem('haccp-staff') || '[]')
      const newStaff = []
      
      preset.staff.forEach((staffConfig, index) => {
        const existingMember = existingStaff.find(s => 
          s.name === staffConfig.name && s.department === staffConfig.department
        )
        
        if (!existingMember) {
          const newMember = {
            id: `staff_${presetKey}_${index + 1}_${Date.now()}`,
            ...staffConfig,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          newStaff.push(newMember)
          result.created.staff++
        }
      })
      
      if (newStaff.length > 0) {
        const allStaff = [...existingStaff, ...newStaff]
        localStorage.setItem('haccp-staff', JSON.stringify(allStaff))
      }
    } catch (error) {
      result.errors.push(`Errore staff: ${error.message}`)
    }

    // Salva il preset applicato
    const presetData = {
      selected: presetKey,
      applied: true,
      appliedAt: new Date().toISOString(),
      created: result.created
    }
    localStorage.setItem('haccp-presets', JSON.stringify(presetData))

    // Se ci sono errori, aggiorna il risultato
    if (result.errors.length > 0) {
      result.success = false
    }

    return result

  } catch (error) {
    return {
      success: false,
      preset: presetKey,
      created: { refrigerators: 0, departments: 0, staff: 0 },
      errors: [error.message]
    }
  }
}

/**
 * Verifica se un preset è già stato applicato
 * @param {string} presetKey - Chiave del preset
 * @returns {boolean} True se il preset è già applicato
 */
export const isPresetApplied = (presetKey) => {
  try {
    const presets = localStorage.getItem('haccp-presets')
    if (presets) {
      const parsed = JSON.parse(presets)
      return parsed.selected === presetKey && parsed.applied === true
    }
  } catch (error) {
    console.warn('Errore nel parsing preset:', error)
  }
  return false
}

/**
 * Ottiene i dettagli di un preset
 * @param {string} presetKey - Chiave del preset
 * @returns {Object|null} Dettagli del preset o null se non trovato
 */
export const getPresetDetails = (presetKey) => {
  return PRESET_CONFIGS[presetKey] || null
}

/**
 * Ottiene tutti i preset disponibili
 * @returns {Object} Tutti i preset disponibili
 */
export const getAllPresets = () => {
  return PRESET_CONFIGS
}

/**
 * Rimuove un preset applicato (non rimuove i dati creati)
 * @param {string} presetKey - Chiave del preset
 * @returns {boolean} True se rimosso con successo
 */
export const removePreset = (presetKey) => {
  try {
    const presets = localStorage.getItem('haccp-presets')
    if (presets) {
      const parsed = JSON.parse(presets)
      if (parsed.selected === presetKey) {
        localStorage.removeItem('haccp-presets')
        return true
      }
    }
    return false
  } catch (error) {
    console.warn('Errore nella rimozione preset:', error)
    return false
  }
}

export default {
  applyPreset,
  isPresetApplied,
  getPresetDetails,
  getAllPresets,
  removePreset
}
