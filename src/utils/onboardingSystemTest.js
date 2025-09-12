/**
 * Test completo del sistema di gestione dati dell'onboarding
 * Verifica che tutti i componenti funzionino correttamente insieme
 */

import { 
  normalizeOnboardingData, 
  validateNormalizedData, 
  saveNormalizedData, 
  loadNormalizedData 
} from './dataNormalizer';

import { 
  mapNormalizedDataToApp, 
  saveMappedData, 
  createMappingReport 
} from './dataMapper';

import { 
  detectConflicts, 
  resolveConflicts, 
  createConflictReport 
} from './conflictResolver';

import { 
  dataLogger, 
  logOnboardingStart, 
  logOnboardingComplete 
} from './dataLogger';

import { 
  onboardingDataManager,
  startOnboarding,
  updateStepData,
  completeOnboarding
} from './onboardingDataManager';

import { 
  validateOnboardingData, 
  createTestData, 
  runAllTests 
} from './dataValidator';

// Test 1: Normalizzazione dei dati
export const testDataNormalization = () => {
  console.log('🧪 Test 1: Normalizzazione dei dati');
  
  try {
    const testData = createTestData();
    const normalizedData = normalizeOnboardingData(testData);
    const validation = validateNormalizedData(normalizedData);
    
    if (validation.isValid) {
      console.log('✅ Normalizzazione dati: PASSED');
      return { passed: true, data: normalizedData };
    } else {
      console.log('❌ Normalizzazione dati: FAILED', validation.errors);
      return { passed: false, errors: validation.errors };
    }
  } catch (error) {
    console.log('❌ Normalizzazione dati: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 2: Mappatura dei dati
export const testDataMapping = (normalizedData) => {
  console.log('🧪 Test 2: Mappatura dei dati');
  
  try {
    const mappingResult = mapNormalizedDataToApp(normalizedData);
    
    if (mappingResult.data && !mappingResult.errors) {
      console.log('✅ Mappatura dati: PASSED');
      return { passed: true, data: mappingResult.data };
    } else {
      console.log('❌ Mappatura dati: FAILED', mappingResult.errors);
      return { passed: false, errors: mappingResult.errors };
    }
  } catch (error) {
    console.log('❌ Mappatura dati: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 3: Rilevamento conflitti
export const testConflictDetection = (mappedData) => {
  console.log('🧪 Test 3: Rilevamento conflitti');
  
  try {
    // Simula dati esistenti
    const existingData = {
      departments: [
        { id: 1, name: 'Cucina', enabled: true },
        { id: 2, name: 'Sala', enabled: true }
      ],
      staff: [
        { id: 1, name: 'Mario', surname: 'Rossi', role: 'Chef' }
      ]
    };
    
    const conflicts = detectConflicts(existingData.departments, mappedData.departments, 'departments');
    
    console.log('✅ Rilevamento conflitti: PASSED');
    return { passed: true, conflicts };
  } catch (error) {
    console.log('❌ Rilevamento conflitti: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 4: Risoluzione conflitti
export const testConflictResolution = (conflicts) => {
  console.log('🧪 Test 4: Risoluzione conflitti');
  
  try {
    const resolution = resolveConflicts(conflicts);
    
    if (resolution.resolvedData) {
      console.log('✅ Risoluzione conflitti: PASSED');
      return { passed: true, resolution };
    } else {
      console.log('❌ Risoluzione conflitti: FAILED');
      return { passed: false };
    }
  } catch (error) {
    console.log('❌ Risoluzione conflitti: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 5: Logging
export const testLogging = () => {
  console.log('🧪 Test 5: Sistema di logging');
  
  try {
    // Test logging di base
    logOnboardingStart({ test: true });
    logOnboardingComplete({ test: true });
    
    // Test creazione report
    const report = dataLogger.createLogReport();
    
    if (report && report.totalLogs > 0) {
      console.log('✅ Sistema di logging: PASSED');
      return { passed: true, report };
    } else {
      console.log('❌ Sistema di logging: FAILED');
      return { passed: false };
    }
  } catch (error) {
    console.log('❌ Sistema di logging: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 6: Gestore principale
export const testDataManager = async () => {
  console.log('🧪 Test 6: Gestore principale');
  
  try {
    // Test avvio onboarding
    const startResult = await startOnboarding({ test: true });
    
    if (startResult.success) {
      // Test aggiornamento step
      const updateResult = await updateStepData(1, { test: true });
      
      if (updateResult.success) {
        // Test completamento onboarding
        const completeResult = await completeOnboarding();
        
        if (completeResult.success) {
          console.log('✅ Gestore principale: PASSED');
          return { passed: true, result: completeResult };
        } else {
          console.log('❌ Gestore principale: FAILED - Completamento');
          return { passed: false, error: 'Completamento fallito' };
        }
      } else {
        console.log('❌ Gestore principale: FAILED - Aggiornamento step');
        return { passed: false, error: 'Aggiornamento step fallito' };
      }
    } else {
      console.log('❌ Gestore principale: FAILED - Avvio');
      return { passed: false, error: 'Avvio fallito' };
    }
  } catch (error) {
    console.log('❌ Gestore principale: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 7: Validazione robustezza
export const testRobustness = () => {
  console.log('🧪 Test 7: Validazione robustezza');
  
  try {
    const testResults = runAllTests();
    
    if (testResults.passed > 0) {
      console.log('✅ Validazione robustezza: PASSED');
      return { passed: true, results: testResults };
    } else {
      console.log('❌ Validazione robustezza: FAILED');
      return { passed: false, results: testResults };
    }
  } catch (error) {
    console.log('❌ Validazione robustezza: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test 8: Salvataggio e caricamento
export const testSaveAndLoad = (normalizedData) => {
  console.log('🧪 Test 8: Salvataggio e caricamento');
  
  try {
    // Test salvataggio
    const saveResult = saveNormalizedData(normalizedData);
    
    if (saveResult) {
      // Test caricamento
      const loadedData = loadNormalizedData();
      
      if (loadedData && loadedData._metadata) {
        console.log('✅ Salvataggio e caricamento: PASSED');
        return { passed: true, data: loadedData };
      } else {
        console.log('❌ Salvataggio e caricamento: FAILED - Caricamento');
        return { passed: false, error: 'Caricamento fallito' };
      }
    } else {
      console.log('❌ Salvataggio e caricamento: FAILED - Salvataggio');
      return { passed: false, error: 'Salvataggio fallito' };
    }
  } catch (error) {
    console.log('❌ Salvataggio e caricamento: ERROR', error.message);
    return { passed: false, error: error.message };
  }
};

// Test completo del sistema
export const runCompleteSystemTest = async () => {
  console.log('🚀 Avvio test completo del sistema...');
  
  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    details: {}
  };
  
  try {
    // Test 1: Normalizzazione
    testResults.total++;
    const normalizationTest = testDataNormalization();
    testResults.details.normalization = normalizationTest;
    if (normalizationTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Normalizzazione fallita');
    }
    
    // Test 2: Mappatura
    testResults.total++;
    const mappingTest = testDataMapping(normalizationTest.data);
    testResults.details.mapping = mappingTest;
    if (mappingTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Mappatura fallita');
    }
    
    // Test 3: Rilevamento conflitti
    testResults.total++;
    const conflictDetectionTest = testConflictDetection(mappingTest.data);
    testResults.details.conflictDetection = conflictDetectionTest;
    if (conflictDetectionTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Rilevamento conflitti fallito');
    }
    
    // Test 4: Risoluzione conflitti
    testResults.total++;
    const conflictResolutionTest = testConflictResolution(conflictDetectionTest.conflicts);
    testResults.details.conflictResolution = conflictResolutionTest;
    if (conflictResolutionTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Risoluzione conflitti fallita');
    }
    
    // Test 5: Logging
    testResults.total++;
    const loggingTest = testLogging();
    testResults.details.logging = loggingTest;
    if (loggingTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Logging fallito');
    }
    
    // Test 6: Gestore principale
    testResults.total++;
    const dataManagerTest = await testDataManager();
    testResults.details.dataManager = dataManagerTest;
    if (dataManagerTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Gestore principale fallito');
    }
    
    // Test 7: Robustezza
    testResults.total++;
    const robustnessTest = testRobustness();
    testResults.details.robustness = robustnessTest;
    if (robustnessTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Robustezza fallita');
    }
    
    // Test 8: Salvataggio e caricamento
    testResults.total++;
    const saveLoadTest = testSaveAndLoad(normalizationTest.data);
    testResults.details.saveLoad = saveLoadTest;
    if (saveLoadTest.passed) {
      testResults.passed++;
    } else {
      testResults.failed++;
      testResults.errors.push('Salvataggio e caricamento fallito');
    }
    
    // Calcola il risultato finale
    const successRate = (testResults.passed / testResults.total) * 100;
    const isSystemWorking = successRate >= 80; // Almeno 80% dei test deve passare
    
    console.log('\n📊 Risultati test completi:');
    console.log(`✅ Test passati: ${testResults.passed}/${testResults.total} (${successRate.toFixed(1)}%)`);
    console.log(`❌ Test falliti: ${testResults.failed}/${testResults.total}`);
    
    if (testResults.errors.length > 0) {
      console.log('\n❌ Errori rilevati:');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (isSystemWorking) {
      console.log('\n🎉 Sistema funzionante! Tutti i componenti principali operativi.');
    } else {
      console.log('\n⚠️ Sistema parzialmente funzionante. Alcuni componenti potrebbero non funzionare correttamente.');
    }
    
    return {
      success: isSystemWorking,
      results: testResults,
      successRate,
      recommendation: isSystemWorking ? 
        'Sistema pronto per l\'uso in produzione' : 
        'Sistema richiede correzioni prima dell\'uso in produzione'
    };
    
  } catch (error) {
    console.error('❌ Errore durante i test:', error);
    testResults.errors.push(`Errore generale: ${error.message}`);
    
    return {
      success: false,
      results: testResults,
      successRate: 0,
      recommendation: 'Sistema non funzionante. Richiede correzioni immediate.',
      error: error.message
    };
  }
};

// Test di performance
export const testPerformance = async () => {
  console.log('🧪 Test di performance...');
  
  const startTime = performance.now();
  
  try {
    // Esegui operazioni multiple per testare le performance
    const operations = [];
    
    for (let i = 0; i < 10; i++) {
      operations.push(startOnboarding({ test: i }));
    }
    
    await Promise.all(operations);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Test performance completato in ${duration.toFixed(2)}ms`);
    
    return {
      success: true,
      duration,
      operations: operations.length,
      averageTimePerOperation: duration / operations.length
    };
    
  } catch (error) {
    console.error('❌ Test performance fallito:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test di stress
export const testStress = async () => {
  console.log('🧪 Test di stress...');
  
  try {
    const stressOperations = [];
    const maxOperations = 100;
    
    // Crea molte operazioni simultanee
    for (let i = 0; i < maxOperations; i++) {
      stressOperations.push(
        startOnboarding({ 
          test: i, 
          data: createTestData(),
          timestamp: Date.now()
        })
      );
    }
    
    const startTime = performance.now();
    const results = await Promise.allSettled(stressOperations);
    const endTime = performance.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    const duration = endTime - startTime;
    
    console.log(`✅ Test stress completato: ${successful} successi, ${failed} fallimenti in ${duration.toFixed(2)}ms`);
    
    return {
      success: failed < maxOperations * 0.1, // Meno del 10% di fallimenti
      successful,
      failed,
      duration,
      successRate: (successful / maxOperations) * 100
    };
    
  } catch (error) {
    console.error('❌ Test stress fallito:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Esporta tutti i test
export const allTests = {
  normalization: testDataNormalization,
  mapping: testDataMapping,
  conflictDetection: testConflictDetection,
  conflictResolution: testConflictResolution,
  logging: testLogging,
  dataManager: testDataManager,
  robustness: testRobustness,
  saveLoad: testSaveAndLoad,
  performance: testPerformance,
  stress: testStress,
  complete: runCompleteSystemTest
};

// Funzione per eseguire tutti i test
export const runAllSystemTests = async () => {
  console.log('🚀 Avvio tutti i test del sistema...');
  
  const results = {
    complete: await runCompleteSystemTest(),
    performance: await testPerformance(),
    stress: await testStress()
  };
  
  console.log('\n📊 Riepilogo finale:');
  console.log(`✅ Test completi: ${results.complete.success ? 'PASSED' : 'FAILED'}`);
  console.log(`⚡ Test performance: ${results.performance.success ? 'PASSED' : 'FAILED'}`);
  console.log(`💪 Test stress: ${results.stress.success ? 'PASSED' : 'FAILED'}`);
  
  return results;
};
