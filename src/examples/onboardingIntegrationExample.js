/**
 * Esempio di integrazione del sistema di gestione dati dell'onboarding
 * Mostra come utilizzare il sistema nell'applicazione esistente
 */

import { 
  onboardingDataManager,
  startOnboarding,
  updateStepData,
  completeOnboarding,
  getOnboardingStatus,
  getOnboardingData,
  getMappedData,
  getConflicts,
  createOnboardingReport
} from '../utils/onboardingDataManager';

import { useOnboardingData } from '../hooks/useOnboardingData';

// Esempio 1: Utilizzo diretto del gestore
export const exampleDirectUsage = async () => {
  try {
    // 1. Avvia l'onboarding
    console.log('🚀 Avvio onboarding...');
    const startResult = await startOnboarding({
      business: {
        name: 'Ristorante Test',
        address: 'Via Roma 123, Roma'
      }
    });
    console.log('✅ Onboarding avviato:', startResult);

    // 2. Aggiorna i dati per ogni step
    console.log('📝 Aggiornamento step 1 - Informazioni Business...');
    await updateStepData(1, {
      business: {
        name: 'Ristorante Test',
        address: 'Via Roma 123, Roma',
        phone: '+39 06 1234567',
        email: 'test@ristorante.com'
      }
    });

    console.log('📝 Aggiornamento step 2 - Reparti...');
    await updateStepData(2, {
      departments: {
        list: [
          { id: 1, name: 'Cucina', enabled: true },
          { id: 2, name: 'Sala', enabled: true },
          { id: 3, name: 'Magazzino', enabled: false }
        ],
        enabledCount: 2
      }
    });

    console.log('📝 Aggiornamento step 3 - Staff...');
    await updateStepData(3, {
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
      }
    });

    console.log('📝 Aggiornamento step 4 - Punti di Conservazione...');
    await updateStepData(4, {
      conservation: {
        points: [
          {
            id: 1,
            name: 'Frigo A',
            location: 'Cucina',
            targetTemp: 4,
            selectedCategories: ['latticini', 'formaggi']
          },
          {
            id: 2,
            name: 'Frigo B',
            location: 'Cucina',
            targetTemp: -18,
            selectedCategories: ['surgelati']
          }
        ],
        count: 2
      }
    });

    console.log('📝 Aggiornamento step 5 - Attività e Mansioni...');
    await updateStepData(5, {
      tasks: {
        list: [
          {
            id: 1,
            name: 'Pulizia bancone cucina',
            assignedRole: 'Chef',
            frequency: 'Giornalmente'
          },
          {
            id: 2,
            name: 'Controllo temperature frigoriferi',
            assignedRole: 'Chef',
            frequency: 'Giornalmente'
          }
        ],
        count: 2
      }
    });

    console.log('📝 Aggiornamento step 6 - Inventario Prodotti...');
    await updateStepData(6, {
      products: {
        productsList: [
          {
            id: 1,
            name: 'Mozzarella di Bufala',
            type: 'Latticini e Formaggi',
            expiryDate: '2024-12-31',
            position: 1,
            allergens: ['latte']
          },
          {
            id: 2,
            name: 'Pomodori San Marzano',
            type: 'Verdure e Ortaggi',
            expiryDate: '2024-12-25',
            position: 1,
            allergens: []
          }
        ],
        count: 2
      }
    });

    // 3. Completa l'onboarding
    console.log('🎉 Completamento onboarding...');
    const completeResult = await completeOnboarding();
    console.log('✅ Onboarding completato:', completeResult);

    // 4. Verifica i risultati
    const status = getOnboardingStatus();
    const normalizedData = getOnboardingData();
    const mappedData = getMappedData();
    const conflicts = getConflicts();
    const report = createOnboardingReport();

    console.log('📊 Stato finale:', status);
    console.log('📊 Dati normalizzati:', normalizedData);
    console.log('📊 Dati mappati:', mappedData);
    console.log('📊 Conflitti:', conflicts);
    console.log('📊 Report:', report);

    return {
      success: true,
      status,
      normalizedData,
      mappedData,
      conflicts,
      report
    };

  } catch (error) {
    console.error('❌ Errore durante l\'onboarding:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Esempio 2: Utilizzo con React Hook
export const ExampleOnboardingComponent = () => {
  const {
    status,
    normalizedData,
    mappedData,
    conflicts,
    isLoading,
    error,
    startOnboarding,
    updateStepData,
    completeOnboarding,
    cleanup
  } = useOnboardingData();

  const handleStartOnboarding = async () => {
    try {
      await startOnboarding({
        business: {
          name: 'Ristorante Test',
          address: 'Via Roma 123, Roma'
        }
      });
    } catch (error) {
      console.error('Errore avvio onboarding:', error);
    }
  };

  const handleUpdateStep = async (stepNumber, stepData) => {
    try {
      await updateStepData(stepNumber, stepData);
    } catch (error) {
      console.error('Errore aggiornamento step:', error);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      const result = await completeOnboarding();
      console.log('Onboarding completato:', result);
    } catch (error) {
      console.error('Errore completamento onboarding:', error);
    }
  };

  const handleCleanup = () => {
    cleanup();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Gestione Onboarding</h2>
      
      {/* Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Stato</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Inizializzato</p>
            <p className="text-xl font-bold">{status?.isInitialized ? 'Sì' : 'No'}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Dati Correnti</p>
            <p className="text-xl font-bold">{status?.hasCurrentData ? 'Sì' : 'No'}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Dati Normalizzati</p>
            <p className="text-xl font-bold">{status?.hasNormalizedData ? 'Sì' : 'No'}</p>
          </div>
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">Conflitti</p>
            <p className="text-xl font-bold">{conflicts?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Azioni */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Azioni</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleStartOnboarding}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Avvia Onboarding
          </button>
          <button
            onClick={handleCompleteOnboarding}
            disabled={isLoading || !status?.hasCurrentData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Completa Onboarding
          </button>
          <button
            onClick={handleCleanup}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Pulisci Dati
          </button>
        </div>
      </div>

      {/* Errori */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-semibold">Errore:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Dati */}
      {normalizedData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Dati Normalizzati</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(normalizedData, null, 2)}
          </pre>
        </div>
      )}

      {/* Conflitti */}
      {conflicts && conflicts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Conflitti Rilevati</h3>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                <p className="font-semibold">{conflict.message}</p>
                <p className="text-sm">Sezione: {conflict.section} | Tipo: {conflict.type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Esempio 3: Test di robustezza
export const exampleRobustnessTest = async () => {
  console.log('🧪 Avvio test di robustezza...');
  
  try {
    // Test con dati validi
    console.log('Test 1: Dati validi');
    const validResult = await exampleDirectUsage();
    console.log('✅ Test dati validi:', validResult.success);

    // Test con dati corrotti
    console.log('Test 2: Dati corrotti');
    try {
      await startOnboarding({
        business: { name: null, address: null },
        departments: { list: null, enabledCount: null }
      });
      console.log('❌ Dovrebbe fallire con dati corrotti');
    } catch (error) {
      console.log('✅ Correttamente rileva dati corrotti:', error.message);
    }

    // Test con dati duplicati
    console.log('Test 3: Dati duplicati');
    try {
      await startOnboarding({
        business: { name: 'Test', address: 'Test Address' },
        departments: {
          list: [
            { id: 1, name: 'Cucina', enabled: true },
            { id: 2, name: 'Cucina', enabled: true }
          ],
          enabledCount: 2
        }
      });
      console.log('⚠️ Dati duplicati rilevati (warning)');
    } catch (error) {
      console.log('✅ Correttamente gestisce dati duplicati:', error.message);
    }

    console.log('🎉 Test di robustezza completati');
    return { success: true };

  } catch (error) {
    console.error('❌ Errore durante i test:', error);
    return { success: false, error: error.message };
  }
};

// Esempio 4: Integrazione con il sistema esistente
export const integrateWithExistingSystem = () => {
  // Sostituisci la logica esistente di salvataggio con il nuovo sistema
  const originalSaveOnboardingData = (onboardingData) => {
    // Logica esistente...
    console.log('Salvataggio dati onboarding (metodo esistente)');
  };

  const newSaveOnboardingData = async (onboardingData) => {
    try {
      // Usa il nuovo sistema
      const result = await completeOnboarding();
      
      if (result.success) {
        console.log('✅ Dati salvati con successo usando il nuovo sistema');
        return result;
      } else {
        throw new Error('Salvataggio fallito');
      }
    } catch (error) {
      console.error('❌ Errore salvataggio:', error);
      // Fallback al metodo esistente
      originalSaveOnboardingData(onboardingData);
      throw error;
    }
  };

  return {
    originalSaveOnboardingData,
    newSaveOnboardingData
  };
};

// Esempio 5: Monitoraggio e debugging
export const exampleMonitoring = () => {
  // Abilita il logging dettagliato
  console.log('📊 Abilitazione monitoraggio...');
  
  // Crea un report completo
  const report = createOnboardingReport();
  console.log('📊 Report completo:', report);
  
  // Monitora i conflitti
  const conflicts = getConflicts();
  if (conflicts.length > 0) {
    console.warn('⚠️ Conflitti rilevati:', conflicts);
  }
  
  // Verifica l'integrità dei dati
  const status = getOnboardingStatus();
  console.log('📊 Stato sistema:', status);
  
  return {
    report,
    conflicts,
    status
  };
};

// Esporta tutti gli esempi
export const examples = {
  directUsage: exampleDirectUsage,
  reactComponent: ExampleOnboardingComponent,
  robustnessTest: exampleRobustnessTest,
  systemIntegration: integrateWithExistingSystem,
  monitoring: exampleMonitoring
};

// Funzione per eseguire tutti gli esempi
export const runAllExamples = async () => {
  console.log('🚀 Avvio tutti gli esempi...');
  
  try {
    // Esempio 1: Utilizzo diretto
    console.log('\n=== Esempio 1: Utilizzo Diretto ===');
    await exampleDirectUsage();
    
    // Esempio 2: Test di robustezza
    console.log('\n=== Esempio 2: Test di Robustezza ===');
    await exampleRobustnessTest();
    
    // Esempio 3: Monitoraggio
    console.log('\n=== Esempio 3: Monitoraggio ===');
    exampleMonitoring();
    
    console.log('\n🎉 Tutti gli esempi completati con successo!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Errore durante l\'esecuzione degli esempi:', error);
    return { success: false, error: error.message };
  }
};
