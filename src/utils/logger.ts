/**
 * Logger Unificato - Foundation Pack v1
 * 
 * Sistema di logging centralizzato con livelli e prefissi
 * Sostituisce console.* sparsi nell'applicazione
 * 
 * @version 1.0
 * @critical Architettura - Logging unificato
 */

// ============================================================================
// TIPI E INTERFACCE
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  area: string
  message: string
  data?: any
  stack?: string
}

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  showTimestamp: boolean
  showArea: boolean
  showStack: boolean
  maxEntries: number
}

// ============================================================================
// CONFIGURAZIONE DEFAULT
// ============================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: import.meta.env.DEV,
  level: import.meta.env.DEV ? 'debug' : 'error',
  showTimestamp: true,
  showArea: true,
  showStack: false,
  maxEntries: 1000
}

// ============================================================================
// CLASSE LOGGER
// ============================================================================

class Logger {
  private config: LoggerConfig = { ...DEFAULT_CONFIG }
  private entries: LogEntry[] = []
  private areas: Set<string> = new Set()

  constructor() {
    this.loadConfig()
  }

  // ============================================================================
  // CONFIGURAZIONE
  // ============================================================================

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
    this.saveConfig()
  }

  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  private loadConfig(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('haccp-logger-config')
        if (saved) {
          const parsed = JSON.parse(saved)
          this.config = { ...this.config, ...parsed }
        }
      } catch (error) {
        console.warn('Errore nel caricamento configurazione logger:', error)
      }
    }
  }

  private saveConfig(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('haccp-logger-config', JSON.stringify(this.config))
      } catch (error) {
        console.warn('Errore nel salvataggio configurazione logger:', error)
      }
    }
  }

  // ============================================================================
  // METODI DI LOGGING
  // ============================================================================

  debug(area: string, message: string, data?: any): void {
    this.log('debug', area, message, data)
  }

  info(area: string, message: string, data?: any): void {
    this.log('info', area, message, data)
  }

  warn(area: string, message: string, data?: any): void {
    this.log('warn', area, message, data)
  }

  error(area: string, message: string, data?: any, error?: Error): void {
    this.log('error', area, message, data, error)
  }

  private log(level: LogLevel, area: string, message: string, data?: any, error?: Error): void {
    if (!this.config.enabled) return

    // Controlla livello di log
    if (!this.shouldLog(level)) return

    // Crea entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      area,
      message,
      data,
      stack: error?.stack
    }

    // Aggiungi all'array
    this.entries.push(entry)
    this.areas.add(area)

    // Mantieni solo gli ultimi N entries
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries)
    }

    // Output alla console
    this.outputToConsole(entry)
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  private outputToConsole(entry: LogEntry): void {
    const { level, area, message, data, stack } = entry
    
    // Prepara il messaggio
    let logMessage = message
    if (this.config.showArea) {
      logMessage = `[${area}] ${logMessage}`
    }
    if (this.config.showTimestamp) {
      const time = new Date(entry.timestamp).toLocaleTimeString()
      logMessage = `[${time}] ${logMessage}`
    }

    // Output con stile
    const style = this.getConsoleStyle(level)
    
    switch (level) {
      case 'debug':
        console.debug(`%c${logMessage}`, style, data || '')
        break
      case 'info':
        console.info(`%c${logMessage}`, style, data || '')
        break
      case 'warn':
        console.warn(`%c${logMessage}`, style, data || '')
        break
      case 'error':
        console.error(`%c${logMessage}`, style, data || '')
        if (stack && this.config.showStack) {
          console.error(stack)
        }
        break
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      debug: 'color: #6b7280; font-weight: normal;',
      info: 'color: #3b82f6; font-weight: normal;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold; background: #fef2f2;'
    }
    
    return styles[level]
  }

  // ============================================================================
  // METODI DI UTILITÀ
  // ============================================================================

  getEntries(area?: string, level?: LogLevel): LogEntry[] {
    let filtered = this.entries

    if (area) {
      filtered = filtered.filter(entry => entry.area === area)
    }

    if (level) {
      filtered = filtered.filter(entry => entry.level === level)
    }

    return [...filtered].reverse() // Più recenti prima
  }

  getAreas(): string[] {
    return Array.from(this.areas).sort()
  }

  clear(): void {
    this.entries = []
    this.areas.clear()
  }

  export(): string {
    return JSON.stringify({
      config: this.config,
      entries: this.entries,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.entries && Array.isArray(parsed.entries)) {
        this.entries = parsed.entries
        this.areas = new Set(parsed.entries.map((e: LogEntry) => e.area))
        return true
      }
      return false
    } catch (error) {
      console.error('Errore nell\'importazione dei log:', error)
      return false
    }
  }
}

// ============================================================================
// ISTANZA SINGLETON
// ============================================================================

const logger = new Logger()

// ============================================================================
// FUNZIONI DI UTILITÀ
// ============================================================================

export const createLogger = (area: string) => {
  return {
    debug: (message: string, data?: any) => logger.debug(area, message, data),
    info: (message: string, data?: any) => logger.info(area, message, data),
    warn: (message: string, data?: any) => logger.warn(area, message, data),
    error: (message: string, data?: any, error?: Error) => logger.error(area, message, data, error)
  }
}

export const setLoggerConfig = (config: Partial<LoggerConfig>): void => {
  logger.setConfig(config)
}

export const getLoggerConfig = (): LoggerConfig => {
  return logger.getConfig()
}

export const getLogEntries = (area?: string, level?: LogLevel): LogEntry[] => {
  return logger.getEntries(area, level)
}

export const getLogAreas = (): string[] => {
  return logger.getAreas()
}

export const clearLogs = (): void => {
  logger.clear()
}

export const exportLogs = (): string => {
  return logger.export()
}

export const importLogs = (data: string): boolean => {
  return logger.import(data)
}

// ============================================================================
// LOGGER PREDEFINITI PER AREA
// ============================================================================

export const appLogger = createLogger('APP')
export const storeLogger = createLogger('STORE')
export const validationLogger = createLogger('VALIDATION')
export const persistenceLogger = createLogger('PERSISTENCE')
export const formLogger = createLogger('FORM')
export const haccpLogger = createLogger('HACCP')
export const uiLogger = createLogger('UI')

// ============================================================================
// ALIAS PER COMPATIBILITÀ
// ============================================================================

// Mantieni compatibilità con le funzioni esistenti
export const debugLog = (message: string, data?: any) => appLogger.debug(message, data)
export const haccpLog = (message: string, data?: any) => haccpLogger.info(message, data)
export const tempLog = (message: string, data?: any) => appLogger.debug(`TEMP: ${message}`, data)
export const maintenanceLog = (message: string, data?: any) => appLogger.debug(`MAINTENANCE: ${message}`, data)
export const migrationLog = (message: string, data?: any) => persistenceLogger.info(`MIGRATION: ${message}`, data)
export const errorLog = (message: string, data?: any, error?: Error) => appLogger.error(message, data, error)

// ============================================================================
// EXPORT PRINCIPALE
// ============================================================================

export default logger
