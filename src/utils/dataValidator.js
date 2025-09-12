/**
 * Sistema di validazione avanzato per i dati dell'onboarding
 * Testa la robustezza e la coerenza dei dati
 */

// Regole di validazione per ogni tipo di dato
export const VALIDATION_RULES = {
  business: {
    name: { required: true, minLength: 2, maxLength: 100 },
    address: { required: true, minLength: 10, maxLength: 200 },
    phone: { required: false, pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/ },
    email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  },
  departments: {
    list: { required: true, minItems: 1, maxItems: 20 },
    enabledCount: { required: true, min: 1 }
  },
  staff: {
    staffMembers: { required: true, minItems: 1, maxItems: 50 }
  },
  conservation: {
    points: { required: true, minItems: 1, maxItems: 20 },
    count: { required: true, min: 1 }
  },
  tasks: {
    list: { required: true, minItems: 0, maxItems: 100 },
    count: { required: true, min: 0 }
  },
  products: {
    productsList: { required: true, minItems: 1, maxItems: 1000 },
    count: { required: true, min: 1 }
  }
};

// Funzione per validare un singolo campo
export const validateField = (value, rules) => {
  const errors = [];
  
  if (rules.required && (value === null || value === undefined || value === '')) {
    errors.push('Campo obbligatorio');
    return errors;
  }
  
  if (value === null || value === undefined || value === '') {
    return errors; // Campo opzionale vuoto
  }
  
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`Minimo ${rules.minLength} caratteri`);
  }
  
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`Massimo ${rules.maxLength} caratteri`);
  }
  
  if (rules.min && value < rules.min) {
    errors.push(`Valore minimo: ${rules.min}`);
  }
  
  if (rules.max && value > rules.max) {
    errors.push(`Valore massimo: ${rules.max}`);
  }
  
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push('Formato non valido');
  }
  
  if (rules.minItems && Array.isArray(value) && value.length < rules.minItems) {
    errors.push(`Minimo ${rules.minItems} elementi`);
  }
  
  if (rules.maxItems && Array.isArray(value) && value.length > rules.maxItems) {
    errors.push(`Massimo ${rules.maxItems} elementi`);
  }
  
  return errors;
};

// Funzione per validare un oggetto completo
export const validateObject = (obj, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const fieldValue = obj[field];
    const fieldErrors = validateField(fieldValue, fieldRules);
    
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

// Funzione per validare i dati dell'onboarding
export const validateOnboardingData = (data) => {
  const validation = {
    isValid: true,
    errors: {},
    warnings: [],
    summary: {
      totalErrors: 0,
      totalWarnings: 0,
      sections: {}
    }
  };
  
  // Valida ogni sezione
  Object.keys(VALIDATION_RULES).forEach(section => {
    const sectionRules = VALIDATION_RULES[section];
    const sectionData = data[section];
    
    if (!sectionData) {
      validation.errors[section] = ['Sezione mancante'];
      validation.isValid = false;
      validation.summary.totalErrors++;
      return;
    }
    
    const sectionValidation = validateObject(sectionData, sectionRules);
    
    if (!sectionValidation.isValid) {
      validation.errors[section] = sectionValidation.errors;
      validation.isValid = false;
      validation.summary.totalErrors += Object.keys(sectionValidation.errors).length;
    }
    
    validation.summary.sections[section] = {
      isValid: sectionValidation.isValid,
      errorCount: Object.keys(sectionValidation.errors).length
    };
  });
  
  // Validazioni aggiuntive
  const additionalValidation = performAdditionalValidations(data);
  validation.warnings.push(...additionalValidation.warnings);
  validation.summary.totalWarnings += additionalValidation.warnings.length;
  
  if (additionalValidation.errors.length > 0) {
    validation.errors.additional = additionalValidation.errors;
    validation.isValid = false;
    validation.summary.totalErrors += additionalValidation.errors.length;
  }
  
  return validation;
};

// Validazioni aggiuntive specifiche per l'applicazione
const performAdditionalValidations = (data) => {
  const warnings = [];
  const errors = [];
  
  // Controlla che i nomi siano unici all'interno di ogni sezione
  const sectionsToCheck = ['departments', 'staff', 'conservation', 'tasks', 'products'];
  
  sectionsToCheck.forEach(section => {
    const sectionData = data[section];
    if (!sectionData) return;
    
    const items = sectionData.list || sectionData.staffMembers || sectionData.points || sectionData.productsList || [];
    
    if (Array.isArray(items)) {
      const names = items.map(item => item.name?.toLowerCase().trim()).filter(Boolean);
      const uniqueNames = new Set(names);
      
      if (names.length !== uniqueNames.size) {
        warnings.push(`${section}: Nomi duplicati rilevati`);
      }
    }
  });
  
  // Controlla che i riferimenti siano validi
  if (data.products?.productsList && data.conservation?.points) {
    const conservationPointIds = new Set(data.conservation.points.map(point => point.id));
    const invalidReferences = data.products.productsList.filter(product => 
      product.position && !conservationPointIds.has(product.position)
    );
    
    if (invalidReferences.length > 0) {
      errors.push(`Prodotti con riferimenti a punti di conservazione non validi: ${invalidReferences.length}`);
    }
  }
  
  // Controlla che le manutenzioni abbiano riferimenti validi
  if (data.savedMaintenances && data.conservation?.points) {
    const conservationPointIds = new Set(data.conservation.points.map(point => point.id));
    const invalidMaintenances = data.savedMaintenances.filter(maintenance => 
      maintenance.conservation_point_id && !conservationPointIds.has(maintenance.conservation_point_id)
    );
    
    if (invalidMaintenances.length > 0) {
      errors.push(`Manutenzioni con riferimenti a punti di conservazione non validi: ${invalidMaintenances.length}`);
    }
  }
  
  // Controlla che i dipendenti abbiano ruoli e categorie validi
  if (data.staff?.staffMembers) {
    const staffMembers = data.staff.staffMembers;
    const invalidStaff = staffMembers.filter(member => 
      !member.name || !member.surname || !member.role
    );
    
    if (invalidStaff.length > 0) {
      warnings.push(`Dipendenti con dati incompleti: ${invalidStaff.length}`);
    }
  }
  
  return { warnings, errors };
};

// Funzione per testare la robustezza del sistema
export const testSystemRobustness = (testData) => {
  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Test 1: Dati vuoti
  const emptyDataTest = validateOnboardingData({});
  testResults.tests.push({
    name: 'Dati vuoti',
    passed: !emptyDataTest.isValid,
    message: emptyDataTest.isValid ? 'Dovrebbe fallire con dati vuoti' : 'Correttamente rileva dati vuoti'
  });
  
  // Test 2: Dati con valori null
  const nullDataTest = validateOnboardingData({
    business: { name: null, address: null },
    departments: { list: null, enabledCount: null }
  });
  testResults.tests.push({
    name: 'Dati null',
    passed: !nullDataTest.isValid,
    message: nullDataTest.isValid ? 'Dovrebbe fallire con dati null' : 'Correttamente rileva dati null'
  });
  
  // Test 3: Dati con valori non validi
  const invalidDataTest = validateOnboardingData({
    business: { name: 'A', address: 'B', email: 'invalid-email' },
    departments: { list: [], enabledCount: 0 }
  });
  testResults.tests.push({
    name: 'Dati non validi',
    passed: !invalidDataTest.isValid,
    message: invalidDataTest.isValid ? 'Dovrebbe fallire con dati non validi' : 'Correttamente rileva dati non validi'
  });
  
  // Test 4: Dati con nomi duplicati
  const duplicateDataTest = validateOnboardingData({
    business: { name: 'Test Business', address: 'Test Address' },
    departments: { 
      list: [
        { id: 1, name: 'Cucina', enabled: true },
        { id: 2, name: 'Cucina', enabled: true }
      ], 
      enabledCount: 2 
    }
  });
  testResults.tests.push({
    name: 'Nomi duplicati',
    passed: duplicateDataTest.warnings.length > 0,
    message: duplicateDataTest.warnings.length > 0 ? 'Correttamente rileva nomi duplicati' : 'Dovrebbe rilevare nomi duplicati'
  });
  
  // Test 5: Dati validi
  const validDataTest = validateOnboardingData(testData);
  testResults.tests.push({
    name: 'Dati validi',
    passed: validDataTest.isValid,
    message: validDataTest.isValid ? 'Dati validi accettati' : 'Dati validi rifiutati'
  });
  
  // Calcola i risultati
  testResults.tests.forEach(test => {
    if (test.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
  });
  
  return testResults;
};

// Funzione per creare dati di test
export const createTestData = () => {
  return {
    business: {
      name: 'Ristorante Test',
      address: 'Via Roma 123, 00100 Roma',
      phone: '+39 06 1234567',
      email: 'test@ristorante.com'
    },
    departments: {
      list: [
        { id: 1, name: 'Cucina', enabled: true },
        { id: 2, name: 'Sala', enabled: true },
        { id: 3, name: 'Magazzino', enabled: false }
      ],
      enabledCount: 2
    },
    staff: {
      staffMembers: [
        {
          id: 1,
          name: 'Mario',
          surname: 'Rossi',
          role: 'Chef',
          categories: ['Cucina'],
          primaryCategory: 'Cucina'
        },
        {
          id: 2,
          name: 'Giulia',
          surname: 'Bianchi',
          role: 'Cameriera',
          categories: ['Sala'],
          primaryCategory: 'Sala'
        }
      ]
    },
    conservation: {
      points: [
        {
          id: 1,
          name: 'Frigo A',
          location: 'Cucina',
          targetTemp: 4,
          selectedCategories: ['latticini', 'formaggi']
        }
      ],
      count: 1
    },
    tasks: {
      list: [
        {
          id: 1,
          name: 'Pulizia bancone',
          assignedRole: 'Chef',
          frequency: 'Giornalmente'
        }
      ],
      count: 1
    },
    products: {
      productsList: [
        {
          id: 1,
          name: 'Mozzarella',
          type: 'Latticini e Formaggi',
          expiryDate: '2024-12-31',
          position: 1
        }
      ],
      count: 1
    }
  };
};

// Funzione per eseguire tutti i test
export const runAllTests = () => {
  const testData = createTestData();
  const results = testSystemRobustness(testData);
  
  console.log('🧪 Test Results:', results);
  
  results.tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}: ${test.message}`);
  });
  
  console.log(`\n📊 Summary: ${results.passed} passed, ${results.failed} failed`);
  
  return results;
};
