/**
 * Sistema di normalizzazione e validazione dei dati dell'onboarding
 * Previene conflitti e garantisce coerenza tra i dati raccolti e quelli salvati
 */

// Schema di validazione per i dati dell'onboarding
export const ONBOARDING_DATA_SCHEMA = {
  business: {
    name: { type: 'string', required: true, minLength: 2 },
    address: { type: 'string', required: true },
    phone: { type: 'string', required: false },
    email: { type: 'string', required: false, format: 'email' },
    coordinates: { type: 'object', required: false }
  },
  departments: {
    list: { type: 'array', required: true, minItems: 1 },
    enabledCount: { type: 'number', required: true, min: 1 }
  },
  staff: {
    staffMembers: { type: 'array', required: true, minItems: 1 }
  },
  conservation: {
    points: { type: 'array', required: true, minItems: 1 },
    count: { type: 'number', required: true, min: 1 }
  },
  tasks: {
    list: { type: 'array', required: true },
    count: { type: 'number', required: true }
  },
  savedMaintenances: {
    type: 'array',
    required: false
  },
  products: {
    productsList: { type: 'array', required: true, minItems: 1 },
    count: { type: 'number', required: true, min: 1 }
  }
};

// Funzioni di normalizzazione per ogni tipo di dato
export const DATA_NORMALIZERS = {
  // Normalizza i dati del business
  business: (data) => {
    if (!data || typeof data !== 'object') return null;
    
    return {
      name: String(data.name || '').trim(),
      address: String(data.address || '').trim(),
      phone: String(data.phone || '').trim(),
      email: String(data.email || '').trim(),
      coordinates: data.coordinates || null,
      via: String(data.via || '').trim(),
      civico: String(data.civico || '').trim(),
      cap: String(data.cap || '').trim(),
      citta: String(data.citta || '').trim(),
      provincia: String(data.provincia || '').trim()
    };
  },

  // Normalizza i reparti
  departments: (data) => {
    if (!data || !Array.isArray(data.list)) return { list: [], enabledCount: 0 };
    
    const normalizedList = data.list.map(dept => ({
      id: dept.id || `dept_${Date.now()}_${Math.random()}`,
      name: String(dept.name || '').trim(),
      enabled: Boolean(dept.enabled),
      isCustom: Boolean(dept.isCustom),
      createdAt: dept.createdAt || new Date().toISOString()
    })).filter(dept => dept.name.length > 0);
    
    const enabledCount = normalizedList.filter(dept => dept.enabled).length;
    
    return {
      list: normalizedList,
      enabledCount,
      lastUpdated: new Date().toISOString()
    };
  },

  // Normalizza i membri dello staff
  staff: (data) => {
    if (!data || !Array.isArray(data.staffMembers)) return { staffMembers: [] };
    
    const normalizedMembers = data.staffMembers.map(member => ({
      id: member.id || `staff_${Date.now()}_${Math.random()}`,
      name: String(member.name || '').trim(),
      surname: String(member.surname || '').trim(),
      role: String(member.role || '').trim(),
      categories: Array.isArray(member.categories) ? member.categories.map(cat => String(cat).trim()) : [],
      primaryCategory: String(member.primaryCategory || '').trim(),
      fullName: `${String(member.name || '').trim()} ${String(member.surname || '').trim()}`.trim(),
      haccpExpiry: member.haccpExpiry || '',
      createdAt: member.createdAt || new Date().toISOString(),
      addedDate: member.addedDate || member.createdAt || new Date().toISOString()
    })).filter(member => member.name.length > 0 && member.surname.length > 0);
    
    return {
      staffMembers: normalizedMembers,
      count: normalizedMembers.length,
      lastUpdated: new Date().toISOString()
    };
  },

  // Normalizza i punti di conservazione
  conservation: (data) => {
    if (!data || !Array.isArray(data.points)) return { points: [], count: 0 };
    
    const normalizedPoints = data.points.map(point => ({
      id: point.id || `point_${Date.now()}_${Math.random()}`,
      name: String(point.name || '').trim(),
      location: String(point.location || '').trim(),
      targetTemp: point.targetTemp || point.setTemperature || point.temperature || point.temp || '',
      selectedCategories: Array.isArray(point.selectedCategories) ? point.selectedCategories : [],
      isAbbattitore: Boolean(point.isAbbattitore),
      compliance: point.compliance || null,
      createdAt: point.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(point => point.name.length > 0);
    
    return {
      points: normalizedPoints,
      count: normalizedPoints.length,
      lastUpdated: new Date().toISOString()
    };
  },

  // Normalizza le attività generiche
  tasks: (data) => {
    if (!data || !Array.isArray(data.list)) return { list: [], count: 0 };
    
    const normalizedTasks = data.list.map(task => ({
      id: task.id || `task_${Date.now()}_${Math.random()}`,
      name: String(task.name || '').trim(),
      assignedRole: String(task.assignedRole || '').trim(),
      assignedEmployee: String(task.assignedEmployee || '').trim(),
      frequency: String(task.frequency || '').trim(),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(task => task.name.length >= 5); // Filtra nomi troppo corti
    
    return {
      list: normalizedTasks,
      count: normalizedTasks.length,
      lastUpdated: new Date().toISOString()
    };
  },

  // Normalizza le manutenzioni salvate
  savedMaintenances: (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(group => ({
      conservation_point_id: group.conservation_point_id,
      conservation_point_name: String(group.conservation_point_name || '').trim(),
      tasks: Array.isArray(group.tasks) ? group.tasks.map(task => ({
        id: task.id || `maintenance_${Date.now()}_${Math.random()}`,
        conservation_point_id: task.conservation_point_id,
        conservation_point_name: String(task.conservation_point_name || '').trim(),
        task_type: String(task.task_type || '').trim(),
        task_name: String(task.task_name || '').trim(),
        frequency: String(task.frequency || '').trim(),
        selected_days: Array.isArray(task.selected_days) ? task.selected_days : [],
        assigned_role: String(task.assigned_role || '').trim(),
        assigned_category: String(task.assigned_category || '').trim(),
        assigned_staff_ids: Array.isArray(task.assigned_staff_ids) ? task.assigned_staff_ids : [],
        is_active: Boolean(task.is_active),
        created_at: task.created_at || new Date().toISOString()
      })) : []
    }));
  },

  // Normalizza i prodotti
  products: (data) => {
    if (!data || !Array.isArray(data.productsList)) return { productsList: [], count: 0 };
    
    const normalizedProducts = data.productsList.map(product => ({
      id: product.id || `product_${Date.now()}_${Math.random()}`,
      name: String(product.name || '').trim(),
      type: String(product.type || '').trim(),
      expiryDate: product.expiryDate || '',
      position: product.position || '',
      allergens: Array.isArray(product.allergens) ? product.allergens : [],
      compliance: product.compliance || null,
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })).filter(product => product.name.length >= 2); // Filtra nomi troppo corti
    
    return {
      productsList: normalizedProducts,
      count: normalizedProducts.length,
      lastUpdated: new Date().toISOString()
    };
  }
};

// Funzione principale per normalizzare tutti i dati dell'onboarding
export const normalizeOnboardingData = (rawData) => {
  console.log('🔄 Normalizing onboarding data:', rawData);
  
  const normalizedData = {};
  const errors = {};
  
  // Normalizza ogni sezione
  Object.keys(ONBOARDING_DATA_SCHEMA).forEach(section => {
    try {
      const normalizer = DATA_NORMALIZERS[section];
      if (normalizer) {
        normalizedData[section] = normalizer(rawData[section]);
        console.log(`✅ Normalized ${section}:`, normalizedData[section]);
      }
    } catch (error) {
      console.error(`❌ Error normalizing ${section}:`, error);
      errors[section] = error.message;
    }
  });
  
  // Aggiungi metadati
  normalizedData._metadata = {
    normalizedAt: new Date().toISOString(),
    version: '1.0.0',
    errors: Object.keys(errors).length > 0 ? errors : null
  };
  
  console.log('✅ Onboarding data normalized:', normalizedData);
  return normalizedData;
};

// Funzione per validare i dati normalizzati
export const validateNormalizedData = (normalizedData) => {
  const errors = {};
  
  Object.keys(ONBOARDING_DATA_SCHEMA).forEach(section => {
    const schema = ONBOARDING_DATA_SCHEMA[section];
    const data = normalizedData[section];
    
    if (schema.required && !data) {
      errors[section] = `${section} is required`;
      return;
    }
    
    if (data && schema.type === 'array' && !Array.isArray(data)) {
      errors[section] = `${section} must be an array`;
      return;
    }
    
    if (data && schema.type === 'object' && typeof data !== 'object') {
      errors[section] = `${section} must be an object`;
      return;
    }
    
    if (data && schema.minItems && Array.isArray(data) && data.length < schema.minItems) {
      errors[section] = `${section} must have at least ${schema.minItems} items`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Funzione per creare i dati di migrazione per il localStorage
export const createMigrationData = (normalizedData) => {
  const migrationData = {
    // Business info
    business: normalizedData.business,
    
    // Departments
    departments: normalizedData.departments?.list || [],
    
    // Staff
    staff: normalizedData.staff?.staffMembers || [],
    
    // Conservation points (refrigerators)
    refrigerators: normalizedData.conservation?.points || [],
    
    // Cleaning tasks
    cleaning: normalizedData.tasks?.list || [],
    
    // Products
    products: normalizedData.products?.productsList || [],
    
    // Maintenance tasks
    maintenanceTasks: normalizedData.savedMaintenances || [],
    
    // Metadata
    _migration: {
      createdAt: new Date().toISOString(),
      source: 'onboarding',
      version: '1.0.0'
    }
  };
  
  console.log('🔄 Created migration data:', migrationData);
  return migrationData;
};

// Funzione per salvare i dati normalizzati nel localStorage
export const saveNormalizedData = (normalizedData) => {
  try {
    // Valida i dati prima di salvarli
    const validation = validateNormalizedData(normalizedData);
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }
    
    // Crea i dati di migrazione
    const migrationData = createMigrationData(normalizedData);
    
    // Salva i dati normalizzati dell'onboarding
    localStorage.setItem('haccp-onboarding-normalized', JSON.stringify(normalizedData));
    
    // Salva i dati di migrazione per le sezioni principali
    Object.keys(migrationData).forEach(key => {
      if (key !== '_migration') {
        localStorage.setItem(`haccp-${key}`, JSON.stringify(migrationData[key]));
      }
    });
    
    // Salva i metadati di migrazione
    localStorage.setItem('haccp-migration-metadata', JSON.stringify(migrationData._migration));
    
    console.log('✅ Normalized data saved to localStorage');
    return true;
  } catch (error) {
    console.error('❌ Error saving normalized data:', error);
    return false;
  }
};

// Funzione per caricare i dati normalizzati dal localStorage
export const loadNormalizedData = () => {
  try {
    const normalizedData = localStorage.getItem('haccp-onboarding-normalized');
    if (normalizedData) {
      return JSON.parse(normalizedData);
    }
    return null;
  } catch (error) {
    console.error('❌ Error loading normalized data:', error);
    return null;
  }
};

// Funzione per pulire i dati duplicati o corrotti
export const cleanCorruptedData = () => {
  const keysToCheck = [
    'haccp-onboarding',
    'haccp-onboarding-new',
    'haccp-onboarding-normalized',
    'haccp-business-info',
    'haccp-departments',
    'haccp-staff',
    'haccp-refrigerators',
    'haccp-cleaning',
    'haccp-products',
    'haccp-maintenance-tasks'
  ];
  
  keysToCheck.forEach(key => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        JSON.parse(data); // Testa se è JSON valido
      }
    } catch (error) {
      console.warn(`🧹 Cleaning corrupted data: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Corrupted data cleaned');
};
