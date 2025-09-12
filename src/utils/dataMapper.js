/**
 * Sistema di mappatura dei dati dell'onboarding alle sezioni principali dell'applicazione
 * Gestisce la trasformazione e il mapping dei dati normalizzati
 */

// Mappature per ogni sezione dell'applicazione
export const DATA_MAPPINGS = {
  // Mappatura per i reparti
  departments: {
    source: 'departments.list',
    transform: (departments) => {
      return departments.map(dept => ({
        id: dept.id,
        name: dept.name,
        enabled: dept.enabled,
        isCustom: dept.isCustom,
        createdAt: dept.createdAt
      }));
    },
    target: 'haccp-departments'
  },

  // Mappatura per lo staff
  staff: {
    source: 'staff.staffMembers',
    transform: (staffMembers) => {
      return staffMembers.map(member => ({
        id: member.id,
        name: member.name,
        surname: member.surname,
        role: member.role,
        categories: member.categories,
        primaryCategory: member.primaryCategory,
        fullName: member.fullName,
        haccpExpiry: member.haccpExpiry,
        createdAt: member.createdAt,
        addedDate: member.addedDate
      }));
    },
    target: 'haccp-staff'
  },

  // Mappatura per i punti di conservazione (refrigerators)
  refrigerators: {
    source: 'conservation.points',
    transform: (points) => {
      return points.map(point => ({
        id: point.id,
        name: point.name,
        location: point.location,
        setTemperature: point.targetTemp,
        targetTemp: point.targetTemp,
        selectedCategories: point.selectedCategories,
        isAbbattitore: point.isAbbattitore,
        compliance: point.compliance,
        maintenanceData: {}, // Sarà popolato dalle manutenzioni
        createdAt: point.createdAt,
        updatedAt: point.updatedAt
      }));
    },
    target: 'haccp-refrigerators'
  },

  // Mappatura per le attività di pulizia
  cleaning: {
    source: 'tasks.list',
    transform: (tasks) => {
      return tasks.map(task => ({
        id: task.id,
        name: task.name,
        assignedRole: task.assignedRole,
        assignedEmployee: task.assignedEmployee,
        frequency: task.frequency,
        status: 'pending',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }));
    },
    target: 'haccp-cleaning'
  },

  // Mappatura per i prodotti
  products: {
    source: 'products.productsList',
    transform: (products) => {
      return products.map(product => ({
        id: product.id,
        name: product.name,
        type: product.type,
        expiryDate: product.expiryDate,
        position: product.position,
        allergens: product.allergens,
        compliance: product.compliance,
        status: 'active',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));
    },
    target: 'haccp-products'
  },

  // Mappatura per le attività di manutenzione
  maintenanceTasks: {
    source: 'savedMaintenances',
    transform: (maintenances) => {
      const tasks = [];
      maintenances.forEach(group => {
        if (Array.isArray(group.tasks)) {
          group.tasks.forEach(task => {
            tasks.push({
              id: task.id,
              company_id: task.company_id || 'default',
              conservation_point_id: task.conservation_point_id,
              conservation_point_name: task.conservation_point_name,
              task_type: task.task_type,
              task_name: task.task_name,
              frequency: task.frequency,
              selected_days: task.selected_days,
              assigned_role: task.assigned_role,
              assigned_category: task.assigned_category,
              assigned_staff_ids: task.assigned_staff_ids,
              is_active: task.is_active,
              created_at: task.created_at
            });
          });
        }
      });
      return tasks;
    },
    target: 'haccp-maintenance-tasks'
  },

  // Mappatura per le informazioni business
  businessInfo: {
    source: 'business',
    transform: (business) => {
      return {
        name: business.name,
        address: business.address,
        phone: business.phone,
        email: business.email,
        coordinates: business.coordinates,
        via: business.via,
        civico: business.civico,
        cap: business.cap,
        citta: business.citta,
        provincia: business.provincia
      };
    },
    target: 'haccp-business-info'
  }
};

// Funzione per mappare i dati normalizzati alle sezioni dell'app
export const mapNormalizedDataToApp = (normalizedData) => {
  console.log('🔄 Mapping normalized data to app sections:', normalizedData);
  
  const mappedData = {};
  const errors = {};
  
  Object.keys(DATA_MAPPINGS).forEach(section => {
    try {
      const mapping = DATA_MAPPINGS[section];
      const sourceData = getNestedValue(normalizedData, mapping.source);
      
      if (sourceData) {
        const transformedData = mapping.transform(sourceData);
        mappedData[section] = transformedData;
        console.log(`✅ Mapped ${section}:`, transformedData);
      } else {
        console.warn(`⚠️ No data found for ${section} at path: ${mapping.source}`);
        mappedData[section] = [];
      }
    } catch (error) {
      console.error(`❌ Error mapping ${section}:`, error);
      errors[section] = error.message;
    }
  });
  
  return {
    data: mappedData,
    errors: Object.keys(errors).length > 0 ? errors : null
  };
};

// Funzione helper per ottenere valori annidati
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
};

// Funzione per salvare i dati mappati nel localStorage
export const saveMappedData = (mappedData) => {
  try {
    Object.keys(mappedData).forEach(section => {
      const mapping = DATA_MAPPINGS[section];
      if (mapping && mappedData[section]) {
        localStorage.setItem(mapping.target, JSON.stringify(mappedData[section]));
        console.log(`✅ Saved ${section} to ${mapping.target}`);
      }
    });
    
    // Salva i metadati di mappatura
    const mappingMetadata = {
      mappedAt: new Date().toISOString(),
      version: '1.0.0',
      sections: Object.keys(mappedData)
    };
    localStorage.setItem('haccp-mapping-metadata', JSON.stringify(mappingMetadata));
    
    console.log('✅ All mapped data saved to localStorage');
    return true;
  } catch (error) {
    console.error('❌ Error saving mapped data:', error);
    return false;
  }
};

// Funzione per creare un report di mappatura
export const createMappingReport = (normalizedData, mappedData) => {
  const report = {
    timestamp: new Date().toISOString(),
    source: 'onboarding',
    sections: {}
  };
  
  Object.keys(DATA_MAPPINGS).forEach(section => {
    const mapping = DATA_MAPPINGS[section];
    const sourceData = getNestedValue(normalizedData, mapping.source);
    const mappedDataForSection = mappedData[section];
    
    report.sections[section] = {
      sourcePath: mapping.source,
      targetKey: mapping.target,
      sourceCount: Array.isArray(sourceData) ? sourceData.length : (sourceData ? 1 : 0),
      mappedCount: Array.isArray(mappedDataForSection) ? mappedDataForSection.length : (mappedDataForSection ? 1 : 0),
      success: Array.isArray(sourceData) ? 
        (Array.isArray(mappedDataForSection) && sourceData.length === mappedDataForSection.length) :
        (sourceData && mappedDataForSection)
    };
  });
  
  console.log('📊 Mapping report created:', report);
  return report;
};

// Funzione per validare l'integrità dei dati mappati
export const validateMappedData = (mappedData) => {
  const validation = {
    isValid: true,
    errors: {},
    warnings: []
  };
  
  Object.keys(mappedData).forEach(section => {
    const data = mappedData[section];
    
    if (!data) {
      validation.errors[section] = 'No data found';
      validation.isValid = false;
      return;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        validation.warnings.push(`${section} is empty`);
      }
      
      // Controlla che tutti gli elementi abbiano un ID
      const itemsWithoutId = data.filter(item => !item.id);
      if (itemsWithoutId.length > 0) {
        validation.errors[section] = `${itemsWithoutId.length} items without ID`;
        validation.isValid = false;
      }
    }
  });
  
  return validation;
};

// Funzione per creare un backup dei dati prima della mappatura
export const createBackup = () => {
  const backup = {
    timestamp: new Date().toISOString(),
    data: {}
  };
  
  Object.keys(DATA_MAPPINGS).forEach(section => {
    const mapping = DATA_MAPPINGS[section];
    const existingData = localStorage.getItem(mapping.target);
    if (existingData) {
      try {
        backup.data[section] = JSON.parse(existingData);
      } catch (error) {
        console.warn(`⚠️ Could not backup ${section}:`, error);
      }
    }
  });
  
  localStorage.setItem('haccp-backup-before-mapping', JSON.stringify(backup));
  console.log('💾 Backup created before mapping');
  return backup;
};

// Funzione per ripristinare i dati dal backup
export const restoreFromBackup = () => {
  try {
    const backup = localStorage.getItem('haccp-backup-before-mapping');
    if (backup) {
      const backupData = JSON.parse(backup);
      
      Object.keys(backupData.data).forEach(section => {
        const mapping = DATA_MAPPINGS[section];
        if (mapping) {
          localStorage.setItem(mapping.target, JSON.stringify(backupData.data[section]));
        }
      });
      
      console.log('🔄 Data restored from backup');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error restoring from backup:', error);
    return false;
  }
};
