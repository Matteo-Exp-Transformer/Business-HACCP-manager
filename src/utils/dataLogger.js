/**
 * Sistema di logging e monitoraggio per le operazioni sui dati
 * Traccia tutte le modifiche, conflitti e operazioni di migrazione
 */

// Livelli di log
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Tipi di operazioni
export const OPERATION_TYPES = {
  ONBOARDING_START: 'onboarding_start',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  DATA_NORMALIZATION: 'data_normalization',
  DATA_MAPPING: 'data_mapping',
  CONFLICT_DETECTION: 'conflict_detection',
  CONFLICT_RESOLUTION: 'conflict_resolution',
  DATA_MIGRATION: 'data_migration',
  DATA_VALIDATION: 'data_validation',
  BACKUP_CREATE: 'backup_create',
  BACKUP_RESTORE: 'backup_restore',
  DATA_CLEANUP: 'data_cleanup'
};

// Classe per il logging dei dati
export class DataLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Limite massimo di log in memoria
  }

  // Aggiunge un log
  log(level, operation, message, data = null) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      operation,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null, // Deep clone per evitare riferimenti
      sessionId: this.getSessionId()
    };

    this.logs.push(logEntry);
    
    // Mantieni solo gli ultimi maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log anche nella console per debug
    const consoleMethod = this.getConsoleMethod(level);
    console[consoleMethod](`[${level.toUpperCase()}] ${operation}: ${message}`, data);

    // Salva nel localStorage per persistenza
    this.saveLogsToStorage();
  }

  // Ottiene il metodo console appropriato
  getConsoleMethod(level) {
    switch (level) {
      case LOG_LEVELS.DEBUG:
        return 'debug';
      case LOG_LEVELS.INFO:
        return 'info';
      case LOG_LEVELS.WARN:
        return 'warn';
      case LOG_LEVELS.ERROR:
        return 'error';
      default:
        return 'log';
    }
  }

  // Genera un ID di sessione
  getSessionId() {
    let sessionId = localStorage.getItem('haccp-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('haccp-session-id', sessionId);
    }
    return sessionId;
  }

  // Salva i log nel localStorage
  saveLogsToStorage() {
    try {
      localStorage.setItem('haccp-data-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving logs to storage:', error);
    }
  }

  // Carica i log dal localStorage
  loadLogsFromStorage() {
    try {
      const storedLogs = localStorage.getItem('haccp-data-logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error('Error loading logs from storage:', error);
      this.logs = [];
    }
  }

  // Ottiene i log per un'operazione specifica
  getLogsByOperation(operation) {
    return this.logs.filter(log => log.operation === operation);
  }

  // Ottiene i log per un livello specifico
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  // Ottiene i log per un periodo di tempo
  getLogsByTimeRange(startTime, endTime) {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }

  // Crea un report dei log
  createLogReport() {
    const report = {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      totalLogs: this.logs.length,
      logsByLevel: {},
      logsByOperation: {},
      recentLogs: this.logs.slice(-50), // Ultimi 50 log
      errors: this.getLogsByLevel(LOG_LEVELS.ERROR),
      warnings: this.getLogsByLevel(LOG_LEVELS.WARN)
    };

    // Raggruppa per livello
    Object.values(LOG_LEVELS).forEach(level => {
      report.logsByLevel[level] = this.getLogsByLevel(level).length;
    });

    // Raggruppa per operazione
    Object.values(OPERATION_TYPES).forEach(operation => {
      report.logsByOperation[operation] = this.getLogsByOperation(operation).length;
    });

    return report;
  }

  // Pulisce i log vecchi
  cleanupOldLogs(daysToKeep = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const initialCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate);
    
    const removedCount = initialCount - this.logs.length;
    this.saveLogsToStorage();
    
    this.log(LOG_LEVELS.INFO, OPERATION_TYPES.DATA_CLEANUP, 
      `Cleaned up ${removedCount} old log entries`, { removedCount, daysToKeep });
    
    return removedCount;
  }

  // Esporta i log
  exportLogs(format = 'json') {
    const data = {
      exportTimestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      logs: this.logs
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data.logs);
    }
    
    return data;
  }

  // Converte i log in formato CSV
  convertToCSV(logs) {
    const headers = ['timestamp', 'level', 'operation', 'message', 'sessionId'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => {
        const value = log[header] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Crea un report di performance
  createPerformanceReport() {
    const operations = {};
    
    this.logs.forEach(log => {
      if (!operations[log.operation]) {
        operations[log.operation] = {
          count: 0,
          errors: 0,
          warnings: 0,
          firstOccurrence: log.timestamp,
          lastOccurrence: log.timestamp
        };
      }
      
      operations[log.operation].count++;
      operations[log.operation].lastOccurrence = log.timestamp;
      
      if (log.level === LOG_LEVELS.ERROR) {
        operations[log.operation].errors++;
      } else if (log.level === LOG_LEVELS.WARN) {
        operations[log.operation].warnings++;
      }
    });

    return {
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      operations,
      summary: {
        totalOperations: Object.keys(operations).length,
        totalLogs: this.logs.length,
        errorRate: this.getLogsByLevel(LOG_LEVELS.ERROR).length / this.logs.length,
        warningRate: this.getLogsByLevel(LOG_LEVELS.WARN).length / this.logs.length
      }
    };
  }
}

// Istanza globale del logger
export const dataLogger = new DataLogger();

// Funzioni di convenienza per il logging
export const logOnboardingStart = (data) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.ONBOARDING_START, 'Onboarding process started', data);
};

export const logOnboardingStep = (step, data) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.ONBOARDING_STEP, `Onboarding step ${step} completed`, data);
};

export const logOnboardingComplete = (data) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.ONBOARDING_COMPLETE, 'Onboarding process completed', data);
};

export const logDataNormalization = (data, errors = null) => {
  const level = errors ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
  const message = errors ? 'Data normalization failed' : 'Data normalization completed';
  dataLogger.log(level, OPERATION_TYPES.DATA_NORMALIZATION, message, { data, errors });
};

export const logDataMapping = (data, errors = null) => {
  const level = errors ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
  const message = errors ? 'Data mapping failed' : 'Data mapping completed';
  dataLogger.log(level, OPERATION_TYPES.DATA_MAPPING, message, { data, errors });
};

export const logConflictDetection = (conflicts) => {
  dataLogger.log(LOG_LEVELS.WARN, OPERATION_TYPES.CONFLICT_DETECTION, 
    `Detected ${conflicts.length} conflicts`, conflicts);
};

export const logConflictResolution = (resolution) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.CONFLICT_RESOLUTION, 
    'Conflicts resolved', resolution);
};

export const logDataMigration = (data, success = true) => {
  const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;
  const message = success ? 'Data migration completed' : 'Data migration failed';
  dataLogger.log(level, OPERATION_TYPES.DATA_MIGRATION, message, data);
};

export const logDataValidation = (validation) => {
  const level = validation.isValid ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;
  const message = validation.isValid ? 'Data validation passed' : 'Data validation failed';
  dataLogger.log(level, OPERATION_TYPES.DATA_VALIDATION, message, validation);
};

export const logBackupCreate = (backup) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.BACKUP_CREATE, 'Backup created', backup);
};

export const logBackupRestore = (backup) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.BACKUP_RESTORE, 'Backup restored', backup);
};

export const logDataCleanup = (cleanup) => {
  dataLogger.log(LOG_LEVELS.INFO, OPERATION_TYPES.DATA_CLEANUP, 'Data cleanup completed', cleanup);
};
