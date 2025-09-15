/**
 * Helper t() - Foundation Pack v1
 * 
 * Helper per traduzioni con parametri
 * Wrapper semplificato per il servizio i18n
 * 
 * @version 1.0
 * @critical Architettura - Helper traduzioni
 */

import { t as i18nT, setLanguage, getLanguage, hasTranslation } from '../i18n'

// ============================================================================
// TIPI
// ============================================================================

export type TranslationParams = Record<string, string | number>

// ============================================================================
// HELPER PRINCIPALE
// ============================================================================

/**
 * Traduce una chiave con parametri opzionali
 * 
 * @param key - Chiave di traduzione (es. 'validation.required')
 * @param params - Parametri per interpolazione (es. { min: 2 })
 * @returns Traduzione o chiave se non trovata
 * 
 * @example
 * t('validation.minLength', { min: 2 }) // "Deve essere di almeno 2 caratteri"
 * t('haccp.temperature.target', { target: 4 }) // "Target: 4°C"
 */
export const t = (key: string, params?: TranslationParams): string => {
  return i18nT(key, params)
}

// ============================================================================
// HELPER SPECIALIZZATI
// ============================================================================

/**
 * Traduce messaggi di validazione
 * 
 * @param field - Campo da validare
 * @param rule - Regola di validazione
 * @param params - Parametri per interpolazione
 * @returns Messaggio di validazione tradotto
 * 
 * @example
 * tValidation('name', 'required') // "Nome obbligatorio"
 * tValidation('temperature', 'outOfRange', { temp: 10, min: 2, max: 4 }) // "Temperatura 10°C fuori range 2-4°C"
 */
export const tValidation = (field: string, rule: string, params?: TranslationParams): string => {
  return t(`validation.${field}.${rule}`, params) || t(`validation.${rule}`, params) || `${field} ${rule}`
}

/**
 * Traduce messaggi HACCP
 * 
 * @param category - Categoria HACCP
 * @param message - Tipo di messaggio
 * @param params - Parametri per interpolazione
 * @returns Messaggio HACCP tradotto
 * 
 * @example
 * tHaccp('temperature', 'outOfRange', { temp: 10, target: 4 }) // "Temperatura fuori range: 10°C vs 4°C"
 * tHaccp('compliance', 'critical') // "Critico"
 */
export const tHaccp = (category: string, message: string, params?: TranslationParams): string => {
  return t(`haccp.${category}.${message}`, params) || t(`haccp.${message}`, params) || `${category} ${message}`
}

/**
 * Traduce messaggi UI
 * 
 * @param component - Componente UI
 * @param element - Elemento del componente
 * @param params - Parametri per interpolazione
 * @returns Messaggio UI tradotto
 * 
 * @example
 * tUI('buttons', 'save') // "Salva"
 * tUI('messages', 'success') // "Operazione completata con successo"
 */
export const tUI = (component: string, element: string, params?: TranslationParams): string => {
  return t(`ui.${component}.${element}`, params) || t(`ui.${element}`, params) || `${component} ${element}`
}

/**
 * Traduce messaggi di errore
 * 
 * @param category - Categoria di errore
 * @param type - Tipo di errore
 * @param params - Parametri per interpolazione
 * @returns Messaggio di errore tradotto
 * 
 * @example
 * tError('forms', 'validationFailed') // "Validazione fallita"
 * tError('data', 'loadFailed') // "Caricamento dati fallito"
 */
export const tError = (category: string, type: string, params?: TranslationParams): string => {
  return t(`errors.${category}.${type}`, params) || t(`errors.${type}`, params) || `${category} ${type}`
}

/**
 * Traduce messaggi educativi
 * 
 * @param topic - Argomento educativo
 * @param aspect - Aspetto specifico
 * @param params - Parametri per interpolazione
 * @returns Messaggio educativo tradotto
 * 
 * @example
 * tEducation('haccp', 'temperature.importance') // "Le temperature corrette sono fondamentali per la sicurezza alimentare"
 */
export const tEducation = (topic: string, aspect: string, params?: TranslationParams): string => {
  return t(`education.${topic}.${aspect}`, params) || t(`education.${aspect}`, params) || `${topic} ${aspect}`
}

/**
 * Traduce messaggi di conferma
 * 
 * @param action - Azione da confermare
 * @param entity - Entità coinvolta
 * @param params - Parametri per interpolazione
 * @returns Messaggio di conferma tradotto
 * 
 * @example
 * tConfirm('delete', 'refrigerator') // "Sei sicuro di voler eliminare questo frigorifero?"
 */
export const tConfirm = (action: string, entity: string, params?: TranslationParams): string => {
  return t(`confirmations.${action}.${entity}`, params) || t(`confirmations.${action}`, params) || `${action} ${entity}`
}

// ============================================================================
// UTILITÀ
// ============================================================================

/**
 * Controlla se una traduzione esiste
 * 
 * @param key - Chiave di traduzione
 * @returns True se la traduzione esiste
 */
export const hasT = (key: string): boolean => {
  return hasTranslation(key)
}

/**
 * Imposta la lingua corrente
 * 
 * @param language - Lingua da impostare ('it' | 'en')
 */
export const setT = (language: 'it' | 'en'): void => {
  setLanguage(language)
}

/**
 * Ottiene la lingua corrente
 * 
 * @returns Lingua corrente
 */
export const getT = (): 'it' | 'en' => {
  return getLanguage()
}

// ============================================================================
// HELPER PER VALIDAZIONI COMUNI
// ============================================================================

/**
 * Messaggi di validazione comuni
 */
export const validationMessages = {
  required: (field: string) => tValidation(field, 'required'),
  minLength: (field: string, min: number) => tValidation(field, 'minLength', { min }),
  maxLength: (field: string, max: number) => tValidation(field, 'maxLength', { max }),
  email: (field: string) => tValidation(field, 'email'),
  phone: (field: string) => tValidation(field, 'phone'),
  min: (field: string, min: number) => tValidation(field, 'min', { min }),
  max: (field: string, max: number) => tValidation(field, 'max', { max })
}

/**
 * Messaggi HACCP comuni
 */
export const haccpMessages = {
  compliant: () => tHaccp('compliance', 'compliant'),
  warning: () => tHaccp('compliance', 'warning'),
  critical: () => tHaccp('compliance', 'critical'),
  temperatureOutOfRange: (temp: number, target: number) => 
    tHaccp('alerts', 'temperatureOutOfRange', { temp, target }),
  productExpiring: () => tHaccp('alerts', 'productExpiring'),
  productExpired: () => tHaccp('alerts', 'productExpired')
}

/**
 * Messaggi UI comuni
 */
export const uiMessages = {
  save: () => tUI('buttons', 'save'),
  cancel: () => tUI('buttons', 'cancel'),
  delete: () => tUI('buttons', 'delete'),
  edit: () => tUI('buttons', 'edit'),
  add: () => tUI('buttons', 'add'),
  success: () => tUI('messages', 'success'),
  error: () => tUI('messages', 'error'),
  loading: () => tUI('messages', 'loading'),
  noData: () => tUI('messages', 'noData')
}

// ============================================================================
// EXPORT PRINCIPALE
// ============================================================================

export default t
