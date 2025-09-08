# Struttura del Progetto HACCP

## Root Directory
```
Business-HACCP-manager/
├── src/                          # Codice sorgente principale
├── public/                       # File statici pubblici
├── docs/                         # Build output (deploy)
├── node_modules/                 # Dipendenze npm
├── reports/                      # Template report
├── src_backup_20250903_223246/   # Backup del codice
├── package.json                  # Configurazione progetto e dipendenze
├── vite.config.js               # Configurazione Vite
├── tailwind.config.js           # Configurazione Tailwind CSS
├── postcss.config.js            # Configurazione PostCSS
├── netlify.toml                 # Configurazione deploy Netlify
├── vercel.json                  # Configurazione deploy Vercel
└── *.md                         # Documentazione progetto
```

## Source Directory (`/src/`)

### File Principali
- **`App.jsx`** - Componente principale dell'applicazione, gestisce routing e stato globale
- **`main.jsx`** - Entry point dell'applicazione, configura React e service worker
- **`index.css`** - Stili globali e configurazione Tailwind

### Components (`/src/components/`)
**Componenti UI Base:**
- `ui/Button.jsx` - Componente bottone riutilizzabile
- `ui/Card.jsx` - Componente card per contenitori
- `ui/Input.jsx` - Componente input personalizzato
- `ui/Label.jsx` - Componente label per form
- `ui/Tabs.jsx` - Sistema di tab per navigazione
- `ui/TemperatureInput.jsx` - Input specializzato per temperature

**Componenti Funzionali Principali:**
- `Dashboard.jsx` - Dashboard principale con statistiche
- `OnboardingWizard.jsx` - Wizard di configurazione iniziale
- `Login.jsx` - Sistema di autenticazione utenti
- `PuntidiConservazione.jsx` - Gestione frigoriferi e temperature
- `Cleaning.jsx` - Gestione attività e mansioni staff
- `Inventory.jsx` - Gestione inventario prodotti
- `ProductLabels.jsx` - Gestione etichette prodotti
- `AIAssistant.jsx` - Assistente IA per supporto
- `AIAssistantSection.jsx` - Sezione dedicata IA
- `DataSettings.jsx` - Impostazioni e configurazioni
- `Gestione.jsx` - Gestione staff e utenti (admin only)

**Componenti di Supporto:**
- `DevModeBanner.jsx` - Banner per modalità sviluppo
- `PWAInstallPrompt.jsx` - Prompt installazione PWA
- `PDFExport.jsx` - Esportazione report PDF
- `StorageManager.jsx` - Gestione storage dati
- `SyncManager.jsx` - Sincronizzazione cloud
- `NotificationSystem.jsx` - Sistema notifiche
- `BackupPanel.jsx` - Pannello backup/restore

**Componenti Onboarding (`/onboarding-steps/`):**
- `BusinessInfoStep.jsx` - Step informazioni azienda
- `DepartmentsStep.jsx` - Step configurazione reparti
- `ConservationStep.jsx` - Step punti di conservazione
- `StaffStep.jsx` - Step configurazione staff
- `TasksStep.jsx` - Step attività e mansioni
- `InventoryStep.jsx` - Step inventario iniziale

**Componenti Automazione (`/automations/`):**
- `ExpiryAlertAutomation.jsx` - Automazione alert scadenze

### Services (`/src/services/`)
- **`dataService.js`** - Servizio per gestione dati locali
- **`supabaseService.js`** - Servizio per operazioni Supabase/cloud

### Hooks (`/src/hooks/`)
- **`useHaccpData.js`** - Hook per gestione dati HACCP
- **`useCan.js`** - Hook per controllo permessi

### Utils (`/src/utils/`)
- **`dataSchemas.js`** - Schemi dati e validazione
- **`haccpRules.js`** - Regole HACCP e validazioni
- **`haccpGuide.js`** - Guida e documentazione HACCP
- **`permissions.js`** - Sistema permessi e ruoli
- **`devMode.js`** - Gestione modalità sviluppo
- **`cloudSimulator.js`** - Simulatore servizi cloud
- **`firebase.js`** - Configurazione Firebase
- **`presetService.js`** - Servizio preset attività
- **`temperatureDatabase.js`** - Database temperature
- **`useHaccpValidation.js`** - Validazioni HACCP

### Lib (`/src/lib/`)
- **`supabase.js`** - Configurazione client Supabase

## Public Directory (`/public/`)
- **`manifest.json`** - Manifest PWA
- **`sw.js`** - Service Worker
- **`favicon.ico`** - Icona favicon
- **`icons/`** - Icone PWA (128x128, 144x144, 152x152, 192x192, 384x384, 512x512, 72x72, 96x96)
- **`assets/help/fridge/`** - Asset di supporto per frigoriferi

## Docs Directory (`/docs/`)
- **Build output** per deploy su GitHub Pages
- **Asset files** con hash per cache busting
- **Static files** per PWA

## Reports Directory (`/reports/`)
- **`templates/`** - Template per report HACCP
- **`HACCP_Report_Modello_Vuoto.txt`** - Template report vuoto

## File di Configurazione

### Build e Deploy
- **`vite.config.js`** - Configurazione Vite (build, dev server, output)
- **`tailwind.config.js`** - Configurazione Tailwind CSS (temi, colori)
- **`postcss.config.js`** - Configurazione PostCSS
- **`netlify.toml`** - Configurazione deploy Netlify
- **`vercel.json`** - Configurazione deploy Vercel
- **`vercel-beta.json`** - Configurazione deploy beta

### Package Management
- **`package.json`** - Dipendenze, script, metadati progetto
- **`package-lock.json`** - Lock file dipendenze
- **`requirements.txt`** - Dipendenze Python (per script ausiliari)

## File di Documentazione
- **`README.md`** - Documentazione principale
- **`HACCP_APP_DOCUMENTATION.md`** - Documentazione specifica HACCP
- **`AGENT_DIRECTIVES.md`** - Direttive per agenti AI
- **`DEPLOY_README.md`** - Guida deploy
- **`PWA_INSTALLATION_GUIDE.md`** - Guida installazione PWA
- **`UX_UI_AUDIT_REPORT.md`** - Report audit UX/UI
- **`*.md`** - Altri file di documentazione e guide

## File di Test e Debug
- **`test-*.html`** - File HTML per test specifici
- **`quick-fix.html`** - File per fix rapidi
- **`fix-localstorage.html`** - Fix per problemi localStorage
- **`ram_monitor.py`** - Script Python per monitoraggio RAM
- **`avvia_monitor_ram.bat`** - Script batch per avvio monitor

## Backup e Versioning
- **`src_backup_20250903_223246/`** - Backup completo del codice sorgente
- **`.git/`** - Repository Git (nascosto)
- **File di commit** - Documentazione modifiche e fix

## Struttura Dati LocalStorage
- **`haccp-*`** - Prefisso per tutti i dati HACCP
- **`haccp-users`** - Utenti e autenticazione
- **`haccp-departments`** - Reparti aziendali
- **`haccp-staff`** - Personale e ruoli
- **`haccp-refrigerators`** - Punti di conservazione
- **`haccp-temperatures`** - Registrazioni temperature
- **`haccp-cleaning`** - Attività e mansioni
- **`haccp-products`** - Inventario prodotti
- **`haccp-product-labels`** - Etichette prodotti
- **`haccp-onboarding`** - Dati onboarding
- **`haccp-dev-mode`** - Configurazione modalità sviluppo

