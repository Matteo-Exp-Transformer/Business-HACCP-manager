# Sistema di Gestione Dati Onboarding

Questo sistema fornisce una soluzione robusta e scalabile per gestire i dati dell'onboarding, prevenendo conflitti e garantendo la coerenza dei dati.

## Componenti Principali

### 1. Data Normalizer (`dataNormalizer.js`)
Normalizza e valida i dati dell'onboarding prima del salvataggio.

```javascript
import { normalizeOnboardingData, validateNormalizedData } from './dataNormalizer';

// Normalizza i dati
const normalizedData = normalizeOnboardingData(rawOnboardingData);

// Valida i dati normalizzati
const validation = validateNormalizedData(normalizedData);
if (validation.isValid) {
  // Procedi con il salvataggio
}
```

### 2. Data Mapper (`dataMapper.js`)
Mappa i dati normalizzati alle sezioni principali dell'applicazione.

```javascript
import { mapNormalizedDataToApp, saveMappedData } from './dataMapper';

// Mappa i dati
const mappingResult = mapNormalizedDataToApp(normalizedData);

// Salva i dati mappati
saveMappedData(mappingResult.data);
```

### 3. Conflict Resolver (`conflictResolver.js`)
Rileva e risolve i conflitti tra dati esistenti e nuovi dati.

```javascript
import { detectConflicts, resolveConflicts } from './conflictResolver';

// Rileva i conflitti
const conflicts = detectConflicts(existingData, newData, 'departments');

// Risolve i conflitti
const resolution = resolveConflicts(conflicts);
```

### 4. Data Logger (`dataLogger.js`)
Traccia tutte le operazioni sui dati per debugging e monitoraggio.

```javascript
import { dataLogger, logOnboardingStart } from './dataLogger';

// Log di un'operazione
logOnboardingStart(onboardingData);

// Crea un report
const report = dataLogger.createLogReport();
```

### 5. Onboarding Data Manager (`onboardingDataManager.js`)
Gestore centralizzato che coordina tutti i componenti.

```javascript
import { onboardingDataManager } from './onboardingDataManager';

// Avvia l'onboarding
onboardingDataManager.startOnboarding(initialData);

// Aggiorna i dati di un step
onboardingDataManager.updateStepData(stepNumber, stepData);

// Completa l'onboarding
const result = await onboardingDataManager.completeOnboarding();
```

## Hook React

### useOnboardingData
Hook principale per gestire i dati dell'onboarding.

```javascript
import { useOnboardingData } from '../hooks/useOnboardingData';

function OnboardingComponent() {
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

  // Usa i dati e le funzioni...
}
```

### useOnboardingConflicts
Hook specifico per gestire i conflitti.

```javascript
import { useOnboardingConflicts } from '../hooks/useOnboardingData';

function ConflictManager() {
  const {
    conflicts,
    resolutionLog,
    isResolving,
    resolveConflicts
  } = useOnboardingConflicts();

  // Gestisci i conflitti...
}
```

## Componenti UI

### OnboardingDataViewer
Componente per visualizzare e gestire i dati dell'onboarding.

```javascript
import OnboardingDataViewer from '../components/OnboardingDataViewer';

function App() {
  const [showDataViewer, setShowDataViewer] = useState(false);

  return (
    <>
      <button onClick={() => setShowDataViewer(true)}>
        Visualizza Dati Onboarding
      </button>
      
      <OnboardingDataViewer 
        isOpen={showDataViewer}
        onClose={() => setShowDataViewer(false)}
      />
    </>
  );
}
```

## Validazione e Test

### Data Validator (`dataValidator.js`)
Sistema di validazione avanzato per testare la robustezza.

```javascript
import { validateOnboardingData, runAllTests } from './dataValidator';

// Valida i dati
const validation = validateOnboardingData(onboardingData);

// Esegui tutti i test
const testResults = runAllTests();
```

## Flusso di Lavoro

1. **Inizio Onboarding**: Chiama `startOnboarding()` con i dati iniziali
2. **Aggiornamento Step**: Usa `updateStepData()` per ogni step completato
3. **Normalizzazione**: I dati vengono automaticamente normalizzati
4. **Mappatura**: I dati vengono mappati alle sezioni dell'app
5. **Rilevamento Conflitti**: Il sistema rileva automaticamente i conflitti
6. **Risoluzione Conflitti**: I conflitti vengono risolti secondo le strategie configurate
7. **Salvataggio**: I dati vengono salvati nel localStorage
8. **Completamento**: Chiama `completeOnboarding()` per finalizzare

## Configurazione

### Strategie di Risoluzione Conflitti
Configura come risolvere i conflitti per ogni sezione:

```javascript
const CONFLICT_RESOLUTION_CONFIG = {
  departments: {
    DUPLICATE_NAME: 'rename',
    DUPLICATE_ID: 'replace_with_new'
  },
  staff: {
    DUPLICATE_NAME: 'rename',
    DUPLICATE_ID: 'replace_with_new'
  }
  // ... altre sezioni
};
```

### Regole di Validazione
Personalizza le regole di validazione:

```javascript
const VALIDATION_RULES = {
  business: {
    name: { required: true, minLength: 2, maxLength: 100 },
    email: { required: false, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
  }
  // ... altre regole
};
```

## Monitoraggio e Debug

### Logging
Tutti gli eventi vengono tracciati automaticamente:

```javascript
// Visualizza i log
const logs = dataLogger.getLogsByOperation('onboarding_start');

// Crea un report
const report = dataLogger.createLogReport();

// Esporta i log
const exportedLogs = dataLogger.exportLogs('json');
```

### Report
Genera report dettagliati:

```javascript
// Report completo
const fullReport = onboardingDataManager.createFullReport();

// Report di mappatura
const mappingReport = createMappingReport(normalizedData, mappedData);

// Report di conflitti
const conflictReport = createConflictReport(conflicts, resolutionLog);
```

## Best Practices

1. **Sempre normalizzare** i dati prima di salvarli
2. **Gestire i conflitti** prima di applicare le modifiche
3. **Validare i dati** a ogni step
4. **Monitorare le operazioni** attraverso i log
5. **Creare backup** prima di operazioni critiche
6. **Testare la robustezza** con dati di test

## Risoluzione Problemi

### Dati Corrotti
```javascript
import { cleanCorruptedData } from './dataNormalizer';

// Pulisce i dati corrotti dal localStorage
cleanCorruptedData();
```

### Ripristino Backup
```javascript
import { restoreFromBackup } from './dataMapper';

// Ripristina i dati dal backup
restoreFromBackup();
```

### Debug Conflitti
```javascript
import { createConflictReport } from './conflictResolver';

// Crea un report dettagliato dei conflitti
const report = createConflictReport(conflicts, resolutionLog);
console.log(report);
```

## Estensibilità

Il sistema è progettato per essere facilmente estendibile:

1. **Aggiungi nuove sezioni** in `DATA_MAPPINGS`
2. **Definisci nuove regole** in `VALIDATION_RULES`
3. **Implementa nuove strategie** di risoluzione conflitti
4. **Crea nuovi tipi di log** in `OPERATION_TYPES`
5. **Aggiungi validazioni personalizzate** in `performAdditionalValidations`

Questo sistema garantisce la robustezza e la coerenza dei dati dell'onboarding, prevenendo conflitti e facilitando la manutenzione del codice.
