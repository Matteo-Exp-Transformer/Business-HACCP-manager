/**
 * Sistema di risoluzione dei conflitti per i dati dell'onboarding
 * Gestisce i conflitti tra dati esistenti e nuovi dati
 */

// Tipi di conflitti possibili
export const CONFLICT_TYPES = {
  DUPLICATE_ID: 'duplicate_id',
  DUPLICATE_NAME: 'duplicate_name',
  MISSING_REFERENCE: 'missing_reference',
  DATA_INCONSISTENCY: 'data_inconsistency',
  VALIDATION_ERROR: 'validation_error'
};

// Strategie di risoluzione
export const RESOLUTION_STRATEGIES = {
  KEEP_EXISTING: 'keep_existing',
  REPLACE_WITH_NEW: 'replace_with_new',
  MERGE: 'merge',
  RENAME: 'rename',
  SKIP: 'skip'
};

// Configurazione per la risoluzione dei conflitti
export const CONFLICT_RESOLUTION_CONFIG = {
  departments: {
    [CONFLICT_TYPES.DUPLICATE_NAME]: RESOLUTION_STRATEGIES.RENAME,
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW
  },
  staff: {
    [CONFLICT_TYPES.DUPLICATE_NAME]: RESOLUTION_STRATEGIES.RENAME,
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW
  },
  refrigerators: {
    [CONFLICT_TYPES.DUPLICATE_NAME]: RESOLUTION_STRATEGIES.RENAME,
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW
  },
  cleaning: {
    [CONFLICT_TYPES.DUPLICATE_NAME]: RESOLUTION_STRATEGIES.RENAME,
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW
  },
  products: {
    [CONFLICT_TYPES.DUPLICATE_NAME]: RESOLUTION_STRATEGIES.RENAME,
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW
  },
  maintenanceTasks: {
    [CONFLICT_TYPES.DUPLICATE_ID]: RESOLUTION_STRATEGIES.REPLACE_WITH_NEW,
    [CONFLICT_TYPES.MISSING_REFERENCE]: RESOLUTION_STRATEGIES.SKIP
  }
};

// Funzione per rilevare i conflitti
export const detectConflicts = (existingData, newData, section) => {
  const conflicts = [];
  
  if (!Array.isArray(existingData) || !Array.isArray(newData)) {
    return conflicts;
  }
  
  // Controlla conflitti di ID duplicati
  const existingIds = new Set(existingData.map(item => item.id).filter(Boolean));
  const duplicateIds = newData.filter(item => existingIds.has(item.id));
  
  if (duplicateIds.length > 0) {
    conflicts.push({
      type: CONFLICT_TYPES.DUPLICATE_ID,
      section,
      items: duplicateIds,
      message: `${duplicateIds.length} items with duplicate IDs`
    });
  }
  
  // Controlla conflitti di nomi duplicati
  const existingNames = new Set(existingData.map(item => item.name?.toLowerCase().trim()).filter(Boolean));
  const duplicateNames = newData.filter(item => 
    item.name && existingNames.has(item.name.toLowerCase().trim())
  );
  
  if (duplicateNames.length > 0) {
    conflicts.push({
      type: CONFLICT_TYPES.DUPLICATE_NAME,
      section,
      items: duplicateNames,
      message: `${duplicateNames.length} items with duplicate names`
    });
  }
  
  // Controlla riferimenti mancanti per le manutenzioni
  if (section === 'maintenanceTasks') {
    const conservationPointIds = new Set(existingData.map(item => item.conservation_point_id).filter(Boolean));
    const invalidReferences = newData.filter(item => 
      item.conservation_point_id && !conservationPointIds.has(item.conservation_point_id)
    );
    
    if (invalidReferences.length > 0) {
      conflicts.push({
        type: CONFLICT_TYPES.MISSING_REFERENCE,
        section,
        items: invalidReferences,
        message: `${invalidReferences.length} maintenance tasks with invalid conservation point references`
      });
    }
  }
  
  return conflicts;
};

// Funzione per risolvere i conflitti
export const resolveConflicts = (conflicts, strategy = null) => {
  const resolvedData = {};
  const resolutionLog = [];
  
  conflicts.forEach(conflict => {
    const section = conflict.section;
    const config = CONFLICT_RESOLUTION_CONFIG[section] || {};
    const conflictStrategy = strategy || config[conflict.type] || RESOLUTION_STRATEGIES.SKIP;
    
    switch (conflictStrategy) {
      case RESOLUTION_STRATEGIES.KEEP_EXISTING:
        resolvedData[section] = conflict.items.map(item => ({
          ...item,
          _conflictResolution: 'kept_existing',
          _originalId: item.id
        }));
        resolutionLog.push({
          section,
          conflictType: conflict.type,
          strategy: conflictStrategy,
          itemsCount: conflict.items.length,
          action: 'Kept existing items'
        });
        break;
        
      case RESOLUTION_STRATEGIES.REPLACE_WITH_NEW:
        resolvedData[section] = conflict.items.map(item => ({
          ...item,
          _conflictResolution: 'replaced_with_new',
          _replacedAt: new Date().toISOString()
        }));
        resolutionLog.push({
          section,
          conflictType: conflict.type,
          strategy: conflictStrategy,
          itemsCount: conflict.items.length,
          action: 'Replaced with new items'
        });
        break;
        
      case RESOLUTION_STRATEGIES.RENAME:
        resolvedData[section] = conflict.items.map((item, index) => ({
          ...item,
          name: `${item.name} (${index + 1})`,
          _conflictResolution: 'renamed',
          _originalName: item.name,
          _renamedAt: new Date().toISOString()
        }));
        resolutionLog.push({
          section,
          conflictType: conflict.type,
          strategy: conflictStrategy,
          itemsCount: conflict.items.length,
          action: 'Renamed duplicate items'
        });
        break;
        
      case RESOLUTION_STRATEGIES.MERGE:
        // Implementa logica di merge specifica per sezione
        resolvedData[section] = mergeItems(conflict.items, section);
        resolutionLog.push({
          section,
          conflictType: conflict.type,
          strategy: conflictStrategy,
          itemsCount: conflict.items.length,
          action: 'Merged items'
        });
        break;
        
      case RESOLUTION_STRATEGIES.SKIP:
      default:
        resolutionLog.push({
          section,
          conflictType: conflict.type,
          strategy: conflictStrategy,
          itemsCount: conflict.items.length,
          action: 'Skipped conflicting items'
        });
        break;
    }
  });
  
  return {
    resolvedData,
    resolutionLog
  };
};

// Funzione per unire gli elementi (merge)
const mergeItems = (items, section) => {
  // Logica di merge specifica per sezione
  switch (section) {
    case 'staff':
      return items.map(item => ({
        ...item,
        _conflictResolution: 'merged',
        _mergedAt: new Date().toISOString()
      }));
      
    case 'departments':
      return items.map(item => ({
        ...item,
        enabled: true, // Mantieni abilitato durante il merge
        _conflictResolution: 'merged',
        _mergedAt: new Date().toISOString()
      }));
      
    default:
      return items.map(item => ({
        ...item,
        _conflictResolution: 'merged',
        _mergedAt: new Date().toISOString()
      }));
  }
};

// Funzione per generare ID unici
export const generateUniqueId = (prefix = 'item', existingIds = []) => {
  const idSet = new Set(existingIds);
  let counter = 1;
  let newId;
  
  do {
    newId = `${prefix}_${Date.now()}_${counter}`;
    counter++;
  } while (idSet.has(newId));
  
  return newId;
};

// Funzione per creare un report di conflitti
export const createConflictReport = (conflicts, resolutionLog) => {
  const report = {
    timestamp: new Date().toISOString(),
    totalConflicts: conflicts.length,
    sections: {},
    resolutions: resolutionLog,
    summary: {
      duplicateIds: conflicts.filter(c => c.type === CONFLICT_TYPES.DUPLICATE_ID).length,
      duplicateNames: conflicts.filter(c => c.type === CONFLICT_TYPES.DUPLICATE_NAME).length,
      missingReferences: conflicts.filter(c => c.type === CONFLICT_TYPES.MISSING_REFERENCE).length,
      dataInconsistencies: conflicts.filter(c => c.type === CONFLICT_TYPES.DATA_INCONSISTENCY).length
    }
  };
  
  // Raggruppa i conflitti per sezione
  conflicts.forEach(conflict => {
    if (!report.sections[conflict.section]) {
      report.sections[conflict.section] = {
        conflicts: [],
        totalItems: 0
      };
    }
    
    report.sections[conflict.section].conflicts.push(conflict);
    report.sections[conflict.section].totalItems += conflict.items.length;
  });
  
  console.log('📊 Conflict report created:', report);
  return report;
};

// Funzione per validare la risoluzione dei conflitti
export const validateConflictResolution = (resolvedData) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };
  
  Object.keys(resolvedData).forEach(section => {
    const data = resolvedData[section];
    
    if (!Array.isArray(data)) {
      validation.errors.push(`${section} is not an array`);
      validation.isValid = false;
      return;
    }
    
    // Controlla che tutti gli elementi abbiano ID unici
    const ids = data.map(item => item.id).filter(Boolean);
    const uniqueIds = new Set(ids);
    
    if (ids.length !== uniqueIds.size) {
      validation.errors.push(`${section} has duplicate IDs after resolution`);
      validation.isValid = false;
    }
    
    // Controlla che tutti gli elementi abbiano nomi unici
    const names = data.map(item => item.name?.toLowerCase().trim()).filter(Boolean);
    const uniqueNames = new Set(names);
    
    if (names.length !== uniqueNames.size) {
      validation.warnings.push(`${section} has duplicate names after resolution`);
    }
  });
  
  return validation;
};

// Funzione per applicare la risoluzione dei conflitti ai dati
export const applyConflictResolution = (existingData, newData, conflicts, resolutionLog) => {
  const finalData = { ...existingData };
  
  Object.keys(resolutionLog).forEach(section => {
    const resolution = resolutionLog[section];
    const resolvedItems = resolution.resolvedData || [];
    
    if (resolution.strategy === RESOLUTION_STRATEGIES.REPLACE_WITH_NEW) {
      // Rimuovi gli elementi esistenti con gli stessi ID
      const idsToReplace = resolvedItems.map(item => item.id);
      finalData[section] = finalData[section].filter(item => !idsToReplace.includes(item.id));
    }
    
    // Aggiungi gli elementi risolti
    finalData[section] = [...(finalData[section] || []), ...resolvedItems];
  });
  
  return finalData;
};
