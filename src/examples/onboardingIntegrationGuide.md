# Guida all'Integrazione del Sistema di Gestione Dati Onboarding

## 🎯 Panoramica

Questa guida ti aiuterà a integrare il nuovo sistema di gestione dati dell'onboarding nella tua applicazione esistente, sostituendo la logica di salvataggio attuale con un sistema più robusto e scalabile.

## 📋 Prerequisiti

- Applicazione React esistente
- Sistema di onboarding funzionante
- Conoscenza base di JavaScript/React
- Accesso ai file sorgente

## 🔄 Processo di Integrazione

### Fase 1: Preparazione

1. **Backup dei dati esistenti**
   ```javascript
   // Crea un backup completo
   const backupData = {
     departments: localStorage.getItem('haccp-departments'),
     staff: localStorage.getItem('haccp-staff'),
     refrigerators: localStorage.getItem('haccp-refrigerators'),
     cleaning: localStorage.getItem('haccp-cleaning'),
     products: localStorage.getItem('haccp-products'),
     maintenanceTasks: localStorage.getItem('haccp-maintenance-tasks')
   };
   
   localStorage.setItem('haccp-backup-before-integration', JSON.stringify(backupData));
   ```

2. **Test del sistema esistente**
   ```javascript
   // Verifica che l'onboarding funzioni correttamente
   // Testa tutti gli step dell'onboarding
   // Verifica che i dati vengano salvati correttamente
   ```

### Fase 2: Installazione dei Componenti

1. **Copia i file del sistema**
   ```
   src/utils/
   ├── dataNormalizer.js
   ├── dataMapper.js
   ├── conflictResolver.js
   ├── dataLogger.js
   ├── onboardingDataManager.js
   ├── dataValidator.js
   └── onboardingConfig.js
   
   src/hooks/
   └── useOnboardingData.js
   
   src/components/
   └── OnboardingDataViewer.jsx
   ```

2. **Installa le dipendenze**
   ```bash
   npm install lucide-react
   ```

### Fase 3: Integrazione Graduale

#### Step 1: Sostituisci la logica di salvataggio

**Prima (logica esistente):**
```javascript
// In OnboardingWizard.jsx
const completeOnboarding = () => {
  // Logica esistente di salvataggio
  localStorage.setItem('haccp-onboarding', JSON.stringify(formData));
  
  // Migra i dati alle sezioni principali
  if (formData.departments?.list) {
    localStorage.setItem('haccp-departments', JSON.stringify(formData.departments.list));
  }
  // ... altre migrazioni
};
```

**Dopo (nuovo sistema):**
```javascript
// In OnboardingWizard.jsx
import { onboardingDataManager } from '../utils/onboardingDataManager';

const completeOnboarding = async () => {
  try {
    // Usa il nuovo sistema
    const result = await onboardingDataManager.completeOnboarding();
    
    if (result.success) {
      console.log('✅ Onboarding completato con successo');
      onComplete && onComplete(result.data);
    } else {
      throw new Error('Completamento onboarding fallito');
    }
  } catch (error) {
    console.error('❌ Errore completamento onboarding:', error);
    // Fallback alla logica esistente se necessario
    // ... logica di fallback
  }
};
```

#### Step 2: Aggiorna i componenti per usare i nuovi hook

**Prima:**
```javascript
// In OnboardingWizard.jsx
const [formData, setFormData] = useState({});

const updateStepData = (stepNumber, stepData) => {
  setFormData(prev => ({
    ...prev,
    ...stepData
  }));
};
```

**Dopo:**
```javascript
// In OnboardingWizard.jsx
import { useOnboardingData } from '../hooks/useOnboardingData';

const OnboardingWizard = () => {
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

  // Usa le funzioni del hook invece della logica locale
  // ...
};
```

#### Step 3: Aggiungi gestione degli errori

```javascript
// In OnboardingWizard.jsx
const handleStepUpdate = async (stepNumber, stepData) => {
  try {
    await updateStepData(stepNumber, stepData);
  } catch (error) {
    console.error('Errore aggiornamento step:', error);
    // Mostra messaggio di errore all'utente
    setErrorMessage(error.message);
  }
};
```

#### Step 4: Aggiungi visualizzazione dei conflitti

```javascript
// In OnboardingWizard.jsx
const renderConflicts = () => {
  if (conflicts && conflicts.length > 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <h4 className="font-bold">Conflitti rilevati:</h4>
        <ul className="list-disc list-inside">
          {conflicts.map((conflict, index) => (
            <li key={index}>{conflict.message}</li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};
```

### Fase 4: Testing e Validazione

#### Test 1: Test di Funzionalità

```javascript
// Crea un file di test
// test/onboardingIntegration.test.js
import { runCompleteSystemTest } from '../src/utils/onboardingSystemTest';

describe('Onboarding Integration', () => {
  test('Sistema funziona correttamente', async () => {
    const results = await runCompleteSystemTest();
    expect(results.complete.success).toBe(true);
  });
});
```

#### Test 2: Test di Robustezza

```javascript
// Test con dati corrotti
const testCorruptedData = () => {
  const corruptedData = {
    business: { name: null, address: null },
    departments: { list: null, enabledCount: null }
  };
  
  // Il sistema dovrebbe gestire correttamente i dati corrotti
  expect(() => {
    normalizeOnboardingData(corruptedData);
  }).not.toThrow();
};
```

#### Test 3: Test di Performance

```javascript
// Test con grandi volumi di dati
const testPerformance = async () => {
  const largeDataset = createLargeDataset(1000); // 1000 elementi
  
  const startTime = performance.now();
  await onboardingDataManager.completeOnboarding(largeDataset);
  const endTime = performance.now();
  
  const duration = endTime - startTime;
  expect(duration).toBeLessThan(5000); // Meno di 5 secondi
};
```

### Fase 5: Monitoraggio e Debug

#### Aggiungi il componente di visualizzazione dati

```javascript
// In App.jsx
import OnboardingDataViewer from './components/OnboardingDataViewer';

const App = () => {
  const [showDataViewer, setShowDataViewer] = useState(false);

  return (
    <div>
      {/* Il resto dell'app */}
      
      {/* Pulsante per aprire il visualizzatore dati (solo in sviluppo) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowDataViewer(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded"
        >
          Visualizza Dati Onboarding
        </button>
      )}
      
      <OnboardingDataViewer
        isOpen={showDataViewer}
        onClose={() => setShowDataViewer(false)}
      />
    </div>
  );
};
```

#### Aggiungi logging dettagliato

```javascript
// In OnboardingWizard.jsx
import { logOnboardingStart, logOnboardingComplete } from '../utils/dataLogger';

const OnboardingWizard = () => {
  useEffect(() => {
    // Log quando l'onboarding inizia
    logOnboardingStart(formData);
  }, []);

  const handleComplete = async () => {
    try {
      const result = await completeOnboarding();
      logOnboardingComplete(result);
    } catch (error) {
      console.error('Errore completamento:', error);
    }
  };
};
```

### Fase 6: Ottimizzazione

#### Configura le impostazioni per l'ambiente

```javascript
// In onboardingConfig.js
export const ONBOARDING_CONFIG = {
  // ... altre impostazioni
  
  // Configurazione per produzione
  enableDetailedLogging: process.env.NODE_ENV === 'development',
  enableAutoBackup: true,
  enableAutoCleanup: true,
  
  // Configurazione per sviluppo
  maxLogs: process.env.NODE_ENV === 'development' ? 1000 : 100,
  logRetentionDays: process.env.NODE_ENV === 'development' ? 7 : 30
};
```

#### Ottimizza le performance

```javascript
// Usa lazy loading per componenti pesanti
const OnboardingDataViewer = lazy(() => import('./components/OnboardingDataViewer'));

// Usa memo per componenti che non cambiano spesso
const OnboardingStep = memo(({ stepData, onUpdate }) => {
  // ...
});
```

## 🔧 Risoluzione Problemi

### Problema: Dati non vengono salvati

**Soluzione:**
```javascript
// Verifica che il sistema sia inizializzato
const status = getOnboardingStatus();
if (!status.isInitialized) {
  onboardingDataManager.initialize();
}

// Verifica che i dati siano validi
const validation = validateNormalizedData(normalizedData);
if (!validation.isValid) {
  console.error('Dati non validi:', validation.errors);
}
```

### Problema: Conflitti non risolti

**Soluzione:**
```javascript
// Verifica la configurazione dei conflitti
const conflicts = getConflicts();
if (conflicts.length > 0) {
  console.log('Conflitti rilevati:', conflicts);
  
  // Risolvi manualmente se necessario
  const resolution = resolveConflicts(conflicts, 'manual');
  console.log('Risoluzione:', resolution);
}
```

### Problema: Performance lente

**Soluzione:**
```javascript
// Abilita le ottimizzazioni
const PERFORMANCE_CONFIG = {
  enableOptimizations: true,
  batchSize: 50, // Riduci la dimensione del batch
  enableCaching: true,
  enableLazyLoading: true
};
```

## 📊 Monitoraggio Post-Integrazione

### Metriche da Monitorare

1. **Tasso di successo dell'onboarding**
   ```javascript
   const successRate = (successfulOnboardings / totalOnboardings) * 100;
   ```

2. **Tempo medio di completamento**
   ```javascript
   const averageTime = totalTime / completedOnboardings;
   ```

3. **Numero di conflitti rilevati**
   ```javascript
   const conflictRate = (conflictsDetected / totalOnboardings) * 100;
   ```

4. **Errori di validazione**
   ```javascript
   const validationErrorRate = (validationErrors / totalValidations) * 100;
   ```

### Report Automatici

```javascript
// Crea report settimanali
const createWeeklyReport = () => {
  const report = createOnboardingReport();
  
  // Invia il report via email o salva in un file
  console.log('Report settimanale:', report);
};
```

## 🎉 Completamento

Una volta completata l'integrazione:

1. ✅ Tutti i test passano
2. ✅ L'onboarding funziona correttamente
3. ✅ I dati vengono salvati senza conflitti
4. ✅ Le performance sono accettabili
5. ✅ Il monitoraggio è attivo
6. ✅ La documentazione è aggiornata

## 📞 Supporto

Se incontri problemi durante l'integrazione:

1. Consulta la documentazione del sistema
2. Esegui i test di sistema
3. Controlla i log per errori
4. Verifica la configurazione
5. Contatta il team di sviluppo

---

**Buona integrazione! 🚀**
