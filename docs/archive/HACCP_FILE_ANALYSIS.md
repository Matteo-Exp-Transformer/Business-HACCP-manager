# Analisi Completa File HACCP Manager

## 1. File Fondamentali per il Flusso Dati

### 1.1 Configurazione Base
- **`package.json`** - Dipendenze principali:
  - React 18.2.0 + React DOM
  - Supabase 2.57.0 (sincronizzazione cloud)
  - Firebase 10.7.1 (backup alternativo)
  - Lucide React (icone)
  - jsPDF (export PDF)
  - Vite (build tool)
  - Tailwind CSS (styling)

- **`vite.config.js`** - Configurazione build:
  - Output directory: `docs/`
  - Asset hashing per cache busting
  - Server dev su porta 3000

### 1.2 Entry Points
- **`src/main.jsx`** - Entry point principale con:
  - Service Worker registration (solo produzione)
  - React StrictMode
  - Gestione aggiornamenti automatici

- **`src/App.jsx`** - Componente principale con:
  - Gestione stato globale (temperatures, cleaning, refrigerators, staff, products, departments)
  - Sistema di routing tramite Tabs
  - Gestione utenti e autenticazione
  - Sistema di notifiche
  - Onboarding wizard
  - Sincronizzazione dati

### 1.3 Gestione Stato e Dati
- **`src/services/dataService.js`** - Servizio centralizzato per:
  - Salvataggio/caricamento da localStorage
  - Validazione dati prima del salvataggio
  - Recovery da backup automatici
  - Pulizia dati corrotti
  - Export/import dati

- **`src/services/supabaseService.js`** - Servizio cloud per:
  - CRUD operations su Supabase
  - Multi-tenancy con company_id
  - Migrazione da localStorage
  - Gestione errori e fallback

- **`src/hooks/useHaccpData.js`** - Hook React per:
  - Integrazione DataService con React
  - Gestione stato loading/error
  - Operazioni CRUD (add, update, remove)
  - Auto-reload dati

### 1.4 Schemi e Validazione
- **`src/utils/dataSchemas.js`** - Schemi dati per:
  - Ruoli staff (gerarchia)
  - Fornitori
  - Onboarding progress
  - Preset attività
  - Modalità sviluppo

- **`src/utils/dataValidation.js`** - Validazione dati per:
  - Schema validation per manutenzioni
  - Sanitizzazione stringhe
  - Validazione oggetti completi
  - Prevenzione errori di parsing

- **`src/utils/haccpRules.js`** - Regole HACCP per:
  - Sequenza onboarding obbligatoria
  - Controlli accesso sezioni
  - Validazioni temperature critiche
  - Regole punti di conservazione

## 2. Flusso Onboarding (Sorgente → Destinazione)

### 2.1 Componenti Step
- **`src/components/OnboardingWizard.jsx`** - Wizard principale con:
  - 6 step sequenziali
  - Validazione per ogni step
  - Salvataggio progresso
  - Gestione errori

- **`src/components/onboarding-steps/`** - Step individuali:
  - `BusinessInfoStep.jsx` - Dati azienda
  - `DepartmentsStep.jsx` - Reparti
  - `StaffStep.jsx` - Personale e ruoli
  - `ConservationStep.jsx` - Punti di conservazione
  - `TasksStep.jsx` - Mansioni e attività
  - `InventoryStep.jsx` - Inventario prodotti

### 2.2 Mapper e Servizi I/O
- **`src/lib/supabase.js`** - Configurazione Supabase:
  - Client Supabase
  - Schema tabelle
  - Struttura company
  - Ruoli utenti

- **`src/services/supabaseService.js`** - Operazioni cloud:
  - Save/Load per ogni entità
  - Migrazione da localStorage
  - Gestione company_id

### 2.3 Esempi Payload Onboarding
I dati vengono salvati in `localStorage` con chiave `haccp-onboarding-new`:

```json
{
  "currentStep": 0,
  "completedSteps": [0, 1, 2, 3, 4, 5],
  "confirmedSteps": [0, 1, 2, 3, 4, 5],
  "formData": {
    "business": {
      "companyName": "Al Ritrovo SRL",
      "address": "Via centotrecento 1/1b Bologna 40128",
      "vatNumber": "001255668899101",
      "email": "000@gmail.com",
      "phone": "0511234567"
    },
    "departments": {
      "list": [
        {
          "id": "cucina",
          "name": "Cucina",
          "description": "Area di preparazione e cottura",
          "location": "Piano terra",
          "manager": "Matteo Cavallaro",
          "enabled": true
        }
      ],
      "enabledCount": 6
    },
    "staff": {
      "staffMembers": [
        {
          "id": "staff_001",
          "name": "Matteo",
          "surname": "Cavallaro",
          "fullName": "Matteo Cavallaro",
          "role": "Responsabile",
          "categories": ["Banconisti", "Amministratore"],
          "certification": "HACCP Avanzato"
        }
      ]
    },
    "conservation": {
      "points": [
        {
          "id": "conservation-1",
          "name": "Frigo A",
          "location": "Cucina",
          "targetTemp": 2,
          "selectedCategories": ["fresh_dairy", "fresh_produce", "fresh_meat"]
        }
      ],
      "count": 7
    },
    "tasks": {
      "list": [
        {
          "id": "task_001",
          "name": "Carico Frigoriferi Bancone",
          "assignedRole": "Banconisti",
          "frequency": "Giornalmente"
        }
      ],
      "count": 1
    },
    "products": {
      "productsList": [
        {
          "id": "product_001",
          "name": "Acqua nat 0,5",
          "type": "Bevande",
          "expiryDate": "2030-03-22",
          "position": "Frigo A",
          "allergens": []
        }
      ],
      "count": 1
    }
  },
  "lastActivity": "2024-01-01T00:00:00.000Z"
}
```

## 3. Tab Principali (Target Destinazione)

### 3.1 Struttura Tab
- **Home** (`dashboard`) - Overview e statistiche
- **Punti di Conservazione** (`refrigerators`) - Gestione frigoriferi/freezer
- **Attività e Mansioni** (`cleaning`) - Mansioni staff e checklist
- **Inventario** (`inventory`) - Prodotti e stock
- **Impostazioni e Dati** (`data-settings`) - Configurazioni e backup
- **Gestione** (`staff`) - Gestione staff, reparti, etichette (Admin only)

### 3.2 Componenti Container
- **`src/components/Dashboard.jsx`** - Home con statistiche
- **`src/components/PuntidiConservazione.jsx`** - Tab 2 (gold standard)
- **`src/components/Cleaning.jsx`** - Attività e mansioni
- **`src/components/Inventory.jsx`** - Inventario prodotti
- **`src/components/DataSettings.jsx`** - Impostazioni
- **`src/components/Gestione.jsx`** - Gestione admin

### 3.3 Componenti Condivisi
- **`src/components/CollapsibleCard.jsx`** - Card collassabile riutilizzabile
- **`src/components/ui/`** - Componenti UI base (Button, Card, Tabs, etc.)

## 4. Tab 2 - Punti di Conservazione (Gold Standard)

### 4.1 File Principali
- **`src/components/PuntidiConservazione.jsx`** - Container principale
- **`src/components/CollapsibleCard.jsx`** - Card per ogni punto
- **`src/components/MaintenanceDisplay.jsx`** - Visualizzazione manutenzioni
- **`src/components/MaintenanceForm.jsx`** - Form aggiunta/modifica

### 4.2 Struttura Dati
```javascript
// Punto di conservazione
{
  id: "conservation-1",
  name: "Frigo A",
  location: "Cucina",
  targetTemp: 2,
  selectedCategories: ["fresh_dairy", "fresh_produce"],
  maintenanceData: {
    temperature_monitoring: [...],
    sanitization: [...],
    defrosting: [...]
  },
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### 4.3 Validazioni HACCP
- **`src/utils/haccpRules.js`** - Regole temperature e categorie
- **`src/utils/dataValidation.js`** - Validazione dati
- Controllo compatibilità temperature/categorie
- Validazione range HACCP

## 5. Gestione Refresh, Concorrenza e Conflitti

### 5.1 Sistema di Tracking
- **`src/App.jsx`** - Funzioni di tracking:
  - `trackDataChange()` - Intercetta cambiamenti
  - `addPendingChange()` - Aggiunge ai pending
  - `handleDataSync()` - Gestisce sincronizzazione

### 5.2 Hook di Dati
- **`src/hooks/useHaccpData.js`** - Hook per:
  - Auto-reload dati
  - Gestione loading/error
  - Operazioni CRUD

### 5.3 Gestione Conflitti
- **`src/services/dataService.js`** - Recovery automatico
- Backup con timestamp
- Pulizia dati corrotti
- Validazione prima del salvataggio

## 6. Persistenza e Sincronizzazione

### 6.1 Adapters
- **`src/services/dataService.js`** - localStorage adapter
- **`src/services/supabaseService.js`** - Supabase adapter
- **`src/lib/supabase.js`** - Configurazione cloud

### 6.2 Chiavi localStorage
```javascript
const KEYS = {
  TEMPERATURES: 'haccp-temperatures',
  REFRIGERATORS: 'haccp-refrigerators',
  CLEANING: 'haccp-cleaning',
  STAFF: 'haccp-staff',
  PRODUCTS: 'haccp-products',
  DEPARTMENTS: 'haccp-departments',
  USERS: 'haccp-users',
  ONBOARDING: 'haccp-onboarding',
  BUSINESS_INFO: 'haccp-business-info',
  // ... altre chiavi
}
```

### 6.3 Strategie di Merge
- **Server wins** per conflitti critici
- **Client wins** per dati locali
- **Last write wins** per dati non critici
- Backup automatico prima di merge

## 7. UI/UX Comuni

### 7.1 Componenti Form
- **`src/components/ui/`** - Componenti base
- **`src/components/forms/`** - Form specifici
- Validatori riutilizzati in `src/utils/`

### 7.2 Gestione Errori
- **`src/components/NotificationSystem.jsx`** - Sistema notifiche
- **`src/components/ui/AlertModal.jsx`** - Modal di errore
- **`src/components/ui/ConfirmModal.jsx`** - Modal di conferma

### 7.3 Componenti Riutilizzabili
- **`src/components/CollapsibleCard.jsx`** - Card collassabile
- **`src/components/StepNavigator.jsx`** - Navigazione step
- **`src/components/HeaderButtons.jsx`** - Pulsanti header

## 8. Config Deploy

### 8.1 Vercel
- **`vercel.json`** - Configurazione Vercel:
  - Build command: `npm run build`
  - Output directory: `docs/`
  - Rewrites per SPA
  - Headers per service worker

### 8.2 PWA
- **`public/manifest.json`** - Manifest PWA
- **`public/sw.js`** - Service Worker
- **`src/components/PWAInstallPrompt.jsx`** - Prompt installazione

### 8.3 Environment
- **`.env`** - Variabili ambiente (non presente)
- **`vite.config.js`** - Configurazione build
- **`tailwind.config.js`** - Configurazione CSS

## 9. Dati di Esempio per Verifiche

### 9.1 Snapshot Stato Tab 2
```json
{
  "refrigerators": [
    {
      "id": "conservation-1",
      "name": "Frigo A",
      "location": "Cucina",
      "targetTemp": 2,
      "selectedCategories": ["fresh_dairy", "fresh_produce", "fresh_meat"],
      "maintenanceData": {
        "temperature_monitoring": [
          {
            "id": "conservation-1_temperature_monitoring_001",
            "task_type": "temperature_monitoring",
            "frequency": "Mensile",
            "assigned_role": "Responsabile",
            "assigned_category": "Banconisti",
            "assigned_staff_ids": ["staff_001"],
            "is_active": true
          }
        ],
        "sanitization": [...],
        "defrosting": [...]
      }
    }
  ],
  "temperatures": [
    {
      "id": "temp_001",
      "refrigeratorId": "conservation-1",
      "temperature": 2.1,
      "timestamp": "2024-01-01T10:00:00.000Z",
      "status": "ok",
      "recordedBy": "staff_001"
    }
  ]
}
```

### 9.2 Snapshot Onboarding Completo
```json
{
  "business": {
    "companyName": "Al Ritrovo SRL",
    "address": "Via centotrecento 1/1b Bologna 40128",
    "vatNumber": "001255668899101",
    "email": "000@gmail.com",
    "phone": "0511234567"
  },
  "departments": {
    "list": [
      {"id": "cucina", "name": "Cucina", "enabled": true},
      {"id": "bancone", "name": "Bancone", "enabled": true},
      {"id": "sala", "name": "Sala", "enabled": true},
      {"id": "magazzino", "name": "Magazzino", "enabled": true}
    ],
    "enabledCount": 4
  },
  "staff": {
    "staffMembers": [
      {
        "id": "staff_001",
        "name": "Matteo",
        "surname": "Cavallaro",
        "fullName": "Matteo Cavallaro",
        "role": "Responsabile",
        "categories": ["Banconisti", "Amministratore"],
        "certification": "HACCP Avanzato"
      }
    ]
  },
  "conservation": {
    "points": [
      {
        "id": "conservation-1",
        "name": "Frigo A",
        "location": "Cucina",
        "targetTemp": 2,
        "selectedCategories": ["fresh_dairy", "fresh_produce", "fresh_meat"]
      }
    ],
    "count": 1
  },
  "tasks": {
    "list": [
      {
        "id": "task_001",
        "name": "Carico Frigoriferi Bancone",
        "assignedRole": "Banconisti",
        "frequency": "Giornalmente"
      }
    ],
    "count": 1
  },
  "products": {
    "productsList": [
      {
        "id": "product_001",
        "name": "Acqua nat 0,5",
        "type": "Bevande",
        "expiryDate": "2030-03-22",
        "position": "Frigo A",
        "allergens": []
      }
    ],
    "count": 1
  }
}
```

## 10. File di Test e Debug

### 10.1 Test Files
- **`src/test/`** - Test unitari
- **`test-*.html`** - Test di visualizzazione
- **`debug-*.js`** - Script di debug

### 10.2 Debug Utilities
- **`src/utils/debug.js`** - Funzioni di logging
- **`src/components/DevButtons.jsx`** - Pulsanti sviluppo
- **`src/components/DevModeBanner.jsx`** - Banner modalità dev

## Conclusioni

Il sistema HACCP Manager è ben strutturato con:

1. **Separazione chiara** tra logica business e UI
2. **Gestione stato centralizzata** con hook personalizzati
3. **Validazione robusta** per dati HACCP critici
4. **Sistema di backup** automatico e recovery
5. **Onboarding guidato** con validazione step-by-step
6. **Sincronizzazione cloud** con fallback locale
7. **Componenti riutilizzabili** per consistenza UI
8. **Configurazione PWA** per uso offline

La Tab 2 (Punti di Conservazione) rappresenta il gold standard per l'implementazione delle altre tab, con validazioni HACCP complete e gestione dati robusta.
