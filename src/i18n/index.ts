/**
 * i18n Scaffold - Foundation Pack v1
 * 
 * Sistema di internazionalizzazione base
 * Supporta solo messaggi di validazione e UX per ora
 * 
 * @version 1.0
 * @critical Architettura - i18n scaffold
 */

import { it } from './it'
import { en } from './en'

// ============================================================================
// TIPI E INTERFACCE
// ============================================================================

export type SupportedLanguage = 'it' | 'en'

export interface I18nConfig {
  defaultLanguage: SupportedLanguage
  fallbackLanguage: SupportedLanguage
  enableFallback: boolean
  enableDebug: boolean
}

export interface Translation {
  [key: string]: string | Translation
}

// ============================================================================
// CONFIGURAZIONE DEFAULT
// ============================================================================

const DEFAULT_CONFIG: I18nConfig = {
  defaultLanguage: 'it',
  fallbackLanguage: 'en',
  enableFallback: true,
  enableDebug: import.meta.env.DEV
}

// ============================================================================
// TRADUZIONI
// ============================================================================

const translations: Record<SupportedLanguage, Translation> = {
  it,
  en
}

// ============================================================================
// CLASSE I18N
// ============================================================================

class I18nService {
  private config: I18nConfig = { ...DEFAULT_CONFIG }
  private currentLanguage: SupportedLanguage = this.config.defaultLanguage

  constructor() {
    this.loadConfig()
    this.detectLanguage()
  }

  // ============================================================================
  // CONFIGURAZIONE
  // ============================================================================

  setConfig(config: Partial<I18nConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()
  }

  getConfig(): I18nConfig {
    return { ...this.config }
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('haccp-i18n-config')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.config = { ...this.config, ...parsed }
        }
      } catch (error) {
        console.warn('Errore nel caricamento configurazione i18n:', error)
      }
    }
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('haccp-i18n-config', JSON.stringify(this.config))
      } catch (error) {
        console.warn('Errore nel salvataggio configurazione i18n:', error)
      }
    }
  }

  // ============================================================================
  // GESTIONE LINGUA
  // ============================================================================

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage = language
    this.saveConfig()
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  private detectLanguage(): void {
    if (typeof window !== 'undefined') {
      // Prova a rilevare la lingua dal browser
      const browserLanguage = navigator.language.split('-')[0] as SupportedLanguage
      
      if (translations[browserLanguage]) {
        this.currentLanguage = browserLanguage
      } else {
        this.currentLanguage = this.config.defaultLanguage
      }
    }
  }

  // ============================================================================
  // TRADUZIONE
  // ============================================================================

  t(key: string, params?: Record<string, string | number>): string {
    try {
      const translation = this.getTranslation(key)
      
      if (!translation) {
        if (this.config.enableDebug) {
          console.warn(`Traduzione mancante per la chiave: ${key}`)
        }
        return key
      }

      // Sostituisci parametri se forniti
      if (params) {
        return this.interpolate(translation, params)
      }

      return translation
    } catch (error) {
      if (this.config.enableDebug) {
        console.error(`Errore nella traduzione per la chiave ${key}:`, error)
      }
      return key
    }
  }

  private getTranslation(key: string): string | null {
    const keys = key.split('.')
    let current: any = translations[this.currentLanguage]

    // Prova a trovare la traduzione nella lingua corrente
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        current = null
        break
      }
    }

    if (typeof current === 'string') {
      return current
    }

    // Se non trovata e fallback abilitato, prova con la lingua di fallback
    if (this.config.enableFallback && this.currentLanguage !== this.config.fallbackLanguage) {
      current = translations[this.config.fallbackLanguage]
      
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k]
        } else {
          current = null
          break
        }
      }

      if (typeof current === 'string') {
        return current
      }
    }

    return null
  }

  private interpolate(text: string, params: Record<string, string | number>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match
    })
  }

  // ============================================================================
  // UTILITÀ
  // ============================================================================

  hasTranslation(key: string): boolean {
    return this.getTranslation(key) !== null
  }

  getAvailableLanguages(): SupportedLanguage[] {
    return Object.keys(translations) as SupportedLanguage[]
  }

  getTranslationsForLanguage(language: SupportedLanguage): Translation {
    return translations[language] || {}
  }

  // ============================================================================
  // VALIDAZIONE
  // ============================================================================

  validateTranslations(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Controlla che tutte le chiavi siano presenti in tutte le lingue
    const allKeys = this.getAllKeys(translations[this.config.defaultLanguage])
    
    for (const language of this.getAvailableLanguages()) {
      if (language === this.config.defaultLanguage) continue
      
      const langTranslations = translations[language]
      
      for (const key of allKeys) {
        if (!this.hasKey(langTranslations, key)) {
          errors.push(`Chiave mancante in ${language}: ${key}`)
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  private getAllKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = []
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        
        if (typeof obj[key] === 'string') {
          keys.push(fullKey)
        } else if (typeof obj[key] === 'object') {
          keys.push(...this.getAllKeys(obj[key], fullKey))
        }
      }
    }
    
    return keys
  }

  private hasKey(obj: any, key: string): boolean {
    const keys = key.split('.')
    let current = obj
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        return false
      }
    }
    
    return typeof current === 'string'
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

const i18nService = new I18nService()

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

export const t = (key: string, params?: Record<string, string | number>): string => {
  return i18nService.t(key, params)
}

export const setLanguage = (language: SupportedLanguage): void => {
  i18nService.setLanguage(language)
}

export const getLanguage = (): SupportedLanguage => {
  return i18nService.getLanguage()
}

export const hasTranslation = (key: string): boolean => {
  return i18nService.hasTranslation(key)
}

export const getAvailableLanguages = (): SupportedLanguage[] => {
  return i18nService.getAvailableLanguages()
}

export const validateTranslations = (): { valid: boolean; errors: string[] } => {
  return i18nService.validateTranslations()
}

// ============================================================================
// EXPORT PRINCIPALE
// ============================================================================

export default i18nService
