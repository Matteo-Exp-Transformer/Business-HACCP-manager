/**
 * useHaccpValidation - Hook per validazione HACCP e controllo accessi
 * 
 * Questo hook fornisce:
 * 1. Controllo accesso alle sezioni
 * 2. Stato di onboarding
 * 3. Validazioni in tempo reale
 * 4. Messaggi educativi per l'utente
 * 
 * @version 1.0
 * @critical Sicurezza alimentare - Validazione accessi
 */

import { useState, useEffect, useMemo } from 'react'
import { checkSectionAccess, checkOnboardingStatus, getValidationMessage } from './haccpRules'

/**
 * Hook per validazione HACCP e controllo accessi
 * @param {Object} data - Dati dell'applicazione (users, departments, refrigerators, staff, etc.)
 * @param {string} currentSection - Sezione attualmente attiva
 * @returns {Object} Oggetto con stato di validazione e controlli
 */
export const useHaccpValidation = (data = {}, currentSection = null) => {
  // Stato di validazione
  const [validationState, setValidationState] = useState({
    isOnboardingComplete: false,
    currentSectionAccess: { isEnabled: true, message: null },
    missingRequirements: [],
    onboardingProgress: 0
  })

  // Calcola lo stato di onboarding
  const onboardingStatus = useMemo(() => {
    return checkOnboardingStatus(data)
  }, [data])

  // Calcola l'accesso alla sezione corrente
  const sectionAccess = useMemo(() => {
    if (!currentSection) return { isEnabled: true, message: null }
    return checkSectionAccess(currentSection, data)
  }, [currentSection, data])

  // Aggiorna lo stato di validazione quando cambiano i dati
  useEffect(() => {
    setValidationState({
      isOnboardingComplete: onboardingStatus.isComplete,
      currentSectionAccess: sectionAccess,
      missingRequirements: sectionAccess.missingRequirements || [],
      onboardingProgress: onboardingStatus.progress
    })
  }, [onboardingStatus, sectionAccess])

  /**
   * Verifica se una sezione specifica è accessibile
   * @param {string} section - Nome della sezione da verificare
   * @returns {Object} Risultato della verifica
   */
  const canAccessSection = (section) => {
    return checkSectionAccess(section, data)
  }

  /**
   * Verifica se tutti i prerequisiti per una sezione sono soddisfatti
   * @param {string} section - Nome della sezione da verificare
   * @returns {boolean} True se tutti i prerequisiti sono soddisfatti
   */
  const areRequirementsMet = (section) => {
    const access = checkSectionAccess(section, data)
    return access.isEnabled
  }

  /**
   * Ottiene i prerequisiti mancanti per una sezione
   * @param {string} section - Nome della sezione da verificare
   * @returns {Array} Array di prerequisiti mancanti
   */
  const getMissingRequirements = (section) => {
    const access = checkSectionAccess(section, data)
    return access.missingRequirements || []
  }

  /**
   * Ottiene il prossimo step da completare nell'onboarding
   * @returns {Object|null} Prossimo step o null se completato
   */
  const getNextOnboardingStep = () => {
    return onboardingStatus.nextStep
  }

  /**
   * Verifica se l'onboarding è completo
   * @returns {boolean} True se l'onboarding è completo
   */
  const isOnboardingComplete = () => {
    return onboardingStatus.isComplete
  }

  /**
   * Ottiene la percentuale di completamento dell'onboarding
   * @returns {number} Percentuale di completamento (0-100)
   */
  const getOnboardingProgress = () => {
    return onboardingStatus.progress
  }

  /**
   * Ottiene i messaggi di validazione per un campo specifico
   * @param {string} type - Tipo di validazione (temperature, expiry, etc.)
   * @param {*} value - Valore da validare
   * @param {Object} context - Contesto aggiuntivo per la validazione
   * @returns {string|null} Messaggio di validazione o null se valido
   */
  const validateField = (type, value, context = {}) => {
    return getValidationMessage(type, value, context)
  }

  /**
   * Ottiene un messaggio educativo per spiegare perché un prerequisito è importante
   * @param {string} requirement - Nome del prerequisito
   * @returns {string} Messaggio educativo
   */
  const getEducationalMessage = (requirement) => {
    const messages = {
      departments: 'I dipartimenti organizzano la struttura operativa e facilitano la gestione HACCP',
      refrigerators: 'I punti di conservazione controllano le temperature critiche per la sicurezza alimentare',
      staff: 'Il personale deve essere formato e responsabile per le procedure HACCP',
      company: 'L\'identificazione aziendale è necessaria per la tracciabilità e compliance normativa'
    }
    
    return messages[requirement] || 'Questo prerequisito è importante per la sicurezza alimentare HACCP'
  }

  /**
   * Ottiene suggerimenti per completare i prerequisiti mancanti
   * @param {Array} missingRequirements - Array di prerequisiti mancanti
   * @returns {Array} Array di suggerimenti
   */
  const getSuggestions = (missingRequirements = []) => {
    const suggestions = []
    
    missingRequirements.forEach(req => {
      switch (req) {
        case 'departments':
          suggestions.push({
            requirement: req,
            action: 'Crea almeno un dipartimento',
            description: 'Es: Cucina, Pizzeria, Bar, Magazzino',
            priority: 'high'
          })
          break
        case 'refrigerators':
          suggestions.push({
            requirement: req,
            action: 'Aggiungi un punto di conservazione',
            description: 'Es: Frigorifero principale, Freezer, Cellar',
            priority: 'high'
          })
          break
        case 'staff':
          suggestions.push({
            requirement: req,
            action: 'Registra un membro dello staff',
            description: 'Es: Pizzaiolo, Cameriere, Responsabile',
            priority: 'medium'
          })
          break
        case 'company':
          suggestions.push({
            requirement: req,
            action: 'Configura le informazioni aziendali',
            description: 'Nome azienda, indirizzo, responsabile',
            priority: 'high'
          })
          break
      }
    })
    
    return suggestions
  }

  return {
    // Stato corrente
    ...validationState,
    
    // Funzioni di utilità
    canAccessSection,
    areRequirementsMet,
    getMissingRequirements,
    getNextOnboardingStep,
    isOnboardingComplete,
    getOnboardingProgress,
    validateField,
    getEducationalMessage,
    getSuggestions,
    
    // Dati grezzi per debug
    onboardingStatus,
    sectionAccess
  }
}

export default useHaccpValidation
