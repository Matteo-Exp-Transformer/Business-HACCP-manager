Vai ai contenuti
Cronologia chat

Hai detto:
**RUOLO:** Sei un ingegnere del software senior e un technical writer eccezionale. Il tuo compito è creare la documentazione di contesto definitiva per un progetto.

**OBIETTIVO:** Produrre una serie di file Markdown (.md) che serviranno come "base di conoscenza" per un Large Language Model (LLM) che assisterà nello sviluppo del progetto. Questi file devono essere così precisi, completi e ben strutturati che l'LLM potrà rispondere a domande di coding come se avesse lavorato sul codice per mesi.

**CONTESTO DI PARTENZA:**
Ecco un'analisi dettagliata del progetto "Business HACCP Manager" che hai prodotto in precedenza. Utilizzala come base di verità assoluta per il contenuto.

<INIZIO ANALISI PRECEDENTE>
Questa è la struttura della mia app : 

Business HACCP Manager — Analisi e Struttura





Obiettivo: catalogare in modo meticoloso l’architettura, i moduli, i dati e i flussi dell’app così com’è oggi, per permettere ad un altro agente/sviluppatore di orientarsi e proseguire il lavoro senza ambiguità.

0) Executive summary

Business HACCP Manager è una Single Page Application (SPA) in React + Vite, con JavaScript (no TypeScript), TailwindCSS per lo styling, PWA (manifest + Service Worker), storage locale (LocalStorage) con un DataService unificato e integrazioni in fase di scaffolding con Firebase e Supabase (non ancora vincolanti ai flussi principali). L’app implementa un set ricco di moduli HACCP: temperature, reparti, inventario, fornitori, pulizie, etichette prodotto, notifiche, sincronizzazione, reporting, backup/export e una procedura di onboarding guidata a step.

Navigazione: non usa react-router-dom (non presente in package.json); i contenuti cambiano via tab/stati interni (es. activeTab), centralizzati in App.jsx.

Persistenza: dati in localStorage (chiavi prefissate haccp-*), con service DataService per CRUD, validazioni, merge e pulizia. Integrazioni cloud simulate (SyncManager), Supabase/Firebase pronte ma non “bloccanti”.

PWA: public/manifest.json + public/sw.js (+ una copia anche in root), prompt di installazione custom e gestione cache offline.

1) Stack & dipendenze

Build/Runtime

Vite (vite.config.js) con plugin @vitejs/plugin-react.

React (18) in modalità Strict (main.jsx).

TailwindCSS (configurato in tailwind.config.js, CSS in src/index.css).

PWA: manifest + service worker; in main.jsx è presente una funzione che disabilita eventuali SW preesistenti in dev.

Librerie principali (estratte da package.json)

react, react-dom

lucide-react (icone)

Cloud (placeholder/integrazione): firebase, @supabase/supabase-js

PDF: jspdf (caricato via CDN in index.html + integrazione in PDFExport.jsx)

DevDeps

vite, @vitejs/plugin-react, tailwindcss, autoprefixer, postcss, eslint e plugin React.

Niente TypeScript — non ci sono typescript/tsconfig.json.

Script npm (principali)

dev, build, preview, lint.

2) Struttura delle cartelle (livello alto)
Business-HACCP-manager/
├─ public/ # Asset PWA, icone, manifest, SW, assets di help
├─ src/
│ ├─ components/ # Moduli UI (feature) + UI library minimale
│ │ ├─ onboarding-steps/
│ │ ├─ automations/
│ │ └─ ui/ # Button, Card, Input, Label, Tabs, ecc.
│ ├─ hooks/ # useCan, useHaccpData
│ ├─ lib/ # supabase.js (client)
│ ├─ services/ # dataService.js, supabaseService.js
│ ├─ utils/ # haccpRules, temperatureDatabase, permissions, presets, ecc.
│ ├─ App.jsx # orchestrazione stati, sezioni, layout
│ ├─ main.jsx # bootstrap React, disattivazione SW in dev
│ └─ index.css # Tailwind base, toast, banner di stato
├─ docs/ # build (es. per GitHub Pages)
├─ index.html # entry HTML (carica jsPDF via CDN, font, manifest)
├─ vite.config.js # build config
├─ tailwind.config.js # theme + estensioni
├─ vercel*.json # config Vercel (prod/beta)
├─ *.md # documentazione interna (vedi §11)
└─ test-*.html # pagine QA manuali

3) Entry points & bootstrap

index.html

Link a Google Fonts, manifest (/manifest.json), icone PWA e jsPDF via CDN.

Monta l’app su <div id="root"> e importa /src/main.jsx.

src/main.jsx

createRoot(...).render(<StrictMode><App/></StrictMode>).

Funzione disableExistingServiceWorker() per deregistrare SW esistenti in ambiente di sviluppo e prevenire cache incoerenti.

src/App.jsx

È il cuore dell’app: gestisce state globale locale, selezione tab/sezioni, caricamento/salvataggio dei dati da/verso localStorage, toggling di feature (PDFExport, PWAInstallPrompt, ecc.).

4) Persistenza & Data layer
4.1 LocalStorage (via DataService)

src/services/dataService.js espone un unico punto di accesso alle chiavi localStorage e fornisce funzioni per:

parsing/serializzazione sicura;

validazione dati (base, con messaggi user-friendly);

merge/migrazioni/sanity check;

cleanup e backup automatici.

Chiavi dichiarate (estratto da static KEYS = { ... }):

haccp-app-data (meta applicativa),

haccp-users, haccp-current-user,

haccp-business-info, haccp-business-data,

haccp-departments, haccp-departments-v2,

haccp-refrigerators, haccp-refrigerators-v2,

haccp-temperatures,

haccp-staff,

haccp-cleaning, haccp-cleaning-departments,

haccp-inventory, haccp-orders, haccp-inventory-products,

haccp-suppliers,

haccp-actions (log attività), haccp-notifications,

haccp-product-labels, haccp-label-groups,

haccp-onboarding,

haccp-presets.

Nota: il codebase contiene sequenze ... (placeholder) in alcuni file/documentazione; la lista sopra è consolidata dove leggibile e coerente col resto dell’app.

4.2 Servizi cloud (stato attuale)

src/lib/supabase.js: factory del client Supabase (richiede variabili .env non incluse). Non usato in flussi critici.

src/services/supabaseService.js: wrapper con metodi nominali (saveCleaningData, saveInventoryData, linkProductToLabel, ecc.). Implementazioni simulate/placeholder con gestione esiti/errore e gating su companyId.

Firebase: presenza in package.json + src/utils/firebase.js con config placeholder, non integrato nei flussi principali.

4.3 Sync & Backup

SyncManager.jsx: UI e logica simulata per sync (upload/download) con progress bar, gestione online/offline, tipologie dati (inventory, temperatures, cleaning, staff, refrigerators).

BackupPanel.jsx: export/import JSON completo, validazione schema di massima, creazione file haccp-backup-YYYY-MM-DD.json.

5) Moduli funzionali (feature)
5.1 Dashboard (Dashboard.jsx)

Panoramica stato HACCP: indicatori (temperatura, pulizie, scadenze, allarmi), accesso rapido ai moduli.

5.2 Temperature & Conservazione

Temperature.jsx + ui/TemperatureInput.jsx: inserimento misure standardizzato (campi/UX coerenti in tutta l’app), con check di conformità secondo regole HACCP.

Data model (record temperatura) — estratto dai componenti:
{
"id": 1735712345678,
"date": "gg/mm/aaaa",
"timestamp": 1735712345678,
"refrigerator": "Frigo A",
"location": "Cucina / Frigo A",
"type": "frigo|freezer|abbattitore|...",
"value": 4.3,
"unit": "°C",
"operator": "Mario Rossi",
"notes": "string",
"status": "ok|warning|danger"
}

Refrigerators_backup.jsx: gestione punti di conservazione (frigo/freezer/abbattitore, categorie prodotto, soglie, suggerimenti temperatura via utils/temperatureDatabase.js).

HelpOverlay.jsx: overlay guida con diagrammi scaffali per tipo di frigo, utile a posizionamento corretto.

5.3 Reparti

Departments.jsx + DepartmentManager.jsx: CRUD reparti, alcuni predefiniti e non eliminabili (p.es. Banconisti, Cuochi, Amministrazione), validazioni (unicità, integrità), vista admin.

CleaningDepartments.jsx: bacheca pulizie per reparto (assegnazione a department.id invece che a user.id).

Documentazione dedicata: DEPARTMENTS_SYSTEM_DOCUMENTATION.md.

5.4 Pulizie & Sanificazione

Cleaning.jsx: task list con stato (ok|warning|danger), priorità, filtri e completion tracking.

Data model (task pulizia):
{
"id": "1735712345678",
"task": "Sanificare piani lavoro",
"assignee": "id utente o reparto",
"frequency": "giornaliera|settimanale|...",
"date": "gg/mm/aaaa",
"completed": false,
"completedAt": null,
"completedBy": null
}

5.5 Inventario & Ordini

Inventory.jsx: tracciabilità prodotti, lotti, scadenze, allergeni, punto di conservazione, reparto e fornitore. Integrazione con onboarding per caricare reparti/punti attivi.

Campi prodotto (form) — estratto dal codice:
{
"name": "Mozzarella",
"category": "Latticini",
"department": "Cucina",
"conservationPoint": "Frigo A",
"expiryDate": "2025-09-30",
"allergens": ["latte"],
"notes": "",
"lotNumber": "L2025-09-001",
"batchDeliveryDate": "2025-09-07",
"supplierName": "Caseificio X",
"associatedOrderId": "ORD-123"
}

Ordini: orderFormData = { orderId, supplierName, orderDate, notes }.

5.6 Fornitori

Suppliers.jsx: anagrafica fornitori con categorie e note.

Campi fornitore (form):
{ "name": "", "category": "", "vat": "", "phone": "", "email": "", "notes": "" }

5.7 Etichette Prodotto

ProductLabels.jsx + StorageManager.jsx: creazione/gestione etichette, eventuale associazione a prodotti dell’inventario, gruppi etichette, download/QR, promemoria scadenze e pulizia automatica etichette scadute.

5.8 Notifiche intelligenti

NotificationSystem.jsx: produce notifiche su temperature critiche, scadenze imminenti, pulizie non eseguite. Evita duplicati (de-dup su type + dataId).

5.9 Onboarding guidato

OnboardingWizard.jsx con step in components/onboarding-steps/:

BusinessInfoStep.jsx (dati azienda, geolocalizzazione e reverse geocoding OSM/Nominatim dove disponibile);

DepartmentsStep.jsx (attivazione reparti — vincoli: p.es. esattamente 4 attivi in alcune checklist);

ConservationStep.jsx (definizione punti di conservazione, tipi e soglie);

InventoryStep.jsx (seme inventario);

StaffStep.jsx (dipendenti/ruoli);

TasksStep.jsx (mansioni iniziali).

Validazione step-by-step, stato “confermato/non confermato”, gating tramite useHaccpValidation + haccpRules.

5.10 Altri moduli

AIAssistant.jsx / AIAssistantSection.jsx: assistente locale (heuristiche) per suggerimenti/azioni, senza dipendenze da LLM esterni.

AdvancedReporting.jsx: filtri per data range (oggi/7/30/90 giorni, custom), KPI e report esportabili.

PDFExport.jsx: bottone contestuale sull’ab di Temperature per esportazione PDF 

<FINE ANALISI PRECEDENTE>



**INPUT AGGIUNTIVO:**


Un altro agente (Cursor) ha già tentato questo compito, producendo i seguenti file. Usali come ispirazione per la struttura, ma **la tua analisi precedente ha la precedenza** su qualsiasi informazione contenuta in questi file. Il tuo compito è fondere e superare questo lavoro.

<INIZIO FILE DI CURSOR>
Tech Stack del Progetto HACCP:
 # Tech Stack del Progetto HACCP

## Frontend
- **React**: 18.2.0 - Framework principale per l'interfaccia utente
- **React DOM**: 18.2.0 - Rendering React nel browser
- **Vite**: 4.4.5 - Build tool e dev server
- **JavaScript (ES6+)**: Linguaggio principale (no TypeScript)

## Styling e UI
- **Tailwind CSS**: 3.3.3 - Framework CSS utility-first
- **Lucide React**: 0.263.1 - Libreria di icone
- **PostCSS**: 8.4.27 - Processore CSS
- **Autoprefixer**: 10.4.14 - Plugin PostCSS per prefissi CSS

## Backend e Database
- **Supabase**: 2.57.0 - Backend-as-a-Service per database e autenticazione
- **Firebase**: 10.7.1 - Servizi cloud alternativi (configurazione)

## Utilità e Librerie
- **jsPDF**: 3.0.1 - Generazione PDF per report
- **ESLint**: 8.45.0 - Linter JavaScript
- **ESLint Plugin React**: 7.32.2 - Regole ESLint per React
- **ESLint Plugin React Hooks**: 4.6.0 - Regole per React Hooks
- **ESLint Plugin React Refresh**: 0.4.3 - Hot reload per React

## Build e Deploy
- **Vite Plugin React**: 4.0.3 - Plugin Vite per React
- **Node.js**: Ambiente di runtime
- **npm**: Package manager

## PWA e Offline
- **Service Worker**: Implementazione custom per funzionalità offline
- **Web App Manifest**: Supporto PWA

## Architettura
- **Single Page Application (SPA)**: Architettura frontend
- **Component-based**: Architettura basata su componenti React
- **Local Storage**: Persistenza dati locale
- **Context API**: Gestione stato globale React
- **Custom Hooks**: Logica riutilizzabile (useHaccpData, useCan)

## Configurazione
- **Environment Variables**: Configurazione tramite variabili d'ambiente
- **Multi-tenant**: Supporto per più aziende
- **Responsive Design**: Design adattivo per mobile e desktop

CODE_STYLE_RULES.MD :
# Regole di Stile e Convenzioni del Progetto HACCP

## Naming Conventions

### Componenti React
- **PascalCase** per nomi di componenti: Dashboard, OnboardingWizard, PuntidiConservazione
- **File naming**: Nomi di file corrispondono ai nomi dei componenti: Dashboard.jsx, Button.jsx
- **Componenti UI**: Prefisso ui/ per componenti base: ui/Button.jsx, ui/Card.jsx

### Funzioni e Variabili
- **camelCase** per funzioni e variabili: handleLogin, currentUser, setTemperatures
- **Arrow functions** preferite per componenti: const Dashboard = ({ temperatures, cleaning }) => { ... }
- **Function declarations** per funzioni utility: function validateHACCPCompliance() { ... }

### Costanti e Enums
- **SCREAMING_SNAKE_CASE** per costanti: CONSERVATION_POINT_RULES, ONBOARDING_RULES
- **PascalCase** per schemi: ROLES_SCHEMA, SUPPLIERS_SCHEMA

### Props e State
- **Destructuring** obbligatorio per props: { temperatures, cleaning, currentUser }
- **Default values** per props: temperatures = [], defaultValue = []
- **State naming**: Prefisso set per setter: setTemperatures, setCurrentUser

## Formattazione e Sintassi

### Indentazione
- **2 spazi** per indentazione (non tab)
- **Consistenza** nell'allineamento di oggetti e array

### Virgolette
- **Apostrofi singoli** per stringhe: 'haccp-temperatures', 'admin'
- **Template literals** per interpolazione: ` Benvenuto, ${currentUser.name}! 

### Import/Export
- **Import order**:
  1. React e librerie esterne
  2. Componenti interni
  3. Utilità e servizi
  4. Stili CSS
- **Named exports** preferiti: export { Button }, export const useHaccpData
- **Default exports** per componenti principali: export default Dashboard

### JSX
- **Self-closing tags** quando possibile: <Thermometer className="h-4 w-4" />
- **Props su righe separate** per componenti complessi
- **Conditional rendering** con operatori ternari: {isAdmin() && <AdminPanel />}

## Gestione Errori

### Try-Catch
- **Try-catch** per operazioni async: try { const result = await DataService.save() } catch (error) { ... }
- **Error logging** con console.warn/error: console.warn('Errore nel parsing:', error)
- **Fallback values** per dati corrotti: JSON.parse(data || '[]')

### Validazione
- **Schema validation** per dati critici: validateSchema(data, schema)
- **Type checking** con typeof: if (typeof data === 'string')
- **Null checks** prima di accesso proprietà: if (businessInfo && businessInfo.businessName)

## Gestione Stato

### useState
- **Stato locale** per componenti: const [activeTab, setActiveTab] = useState('dashboard')
- **Inizializzazione** con valori di default: useState([]), useState(null)
- **Functional updates** per dipendenze: setData(prev => [...prev, newItem])

### useEffect
- **Dependency arrays** sempre specificate: useEffect(() => { ... }, [temperatures, currentUser])
- **Cleanup functions** per eventi: return () => window.removeEventListener('storage', handler)
- **Conditional effects** per performance: if (currentUser) { ... }

### Custom Hooks
- **Prefisso use**: useHaccpData, useCan
- **Return object** con proprietà nominate: return { data, loading, error, saveData }
- **Memoization** con useCallback per funzioni: const saveData = useCallback(async (newData) => { ... }, [key])

## Commenti e Documentazione

### JSDoc
- **File headers** con descrizione e avvertenze critiche
- **@fileoverview** per descrizione file
- **@critical** per funzionalità HACCP critiche
- **@version** per versioning

### Commenti Inline
- **Commenti esplicativi** per logica complessa
- **TODO** per funzionalità future: // TODO: Implementare validazione completa
- **FIXME** per bug noti: // FIXME: Gestire errore di parsing

### Avvertenze Critiche
- **Header warnings** per file critici HACCP
- **Emoji** per identificare sezioni: 🚨, ⚠️, ✅, ❌
- **Messaggi chiari** per modifiche pericolose

## Struttura File

### Organizzazione
- **Un componente per file** (eccezione per componenti molto piccoli)
- **Cartelle per categorie**: components/, utils/, services/, hooks/
- **File index** per esportazioni multiple

### Imports Relativi
- **Path relativi** per file interni: './ui/Button', '../utils/dataSchemas'
- **Path assoluti** per librerie: 'react', 'lucide-react'

## Performance

### Memoization
- **useCallback** per funzioni passate come props
- **useMemo** per calcoli costosi (quando necessario)
- **React.memo** per componenti che si ri-renderizzano spesso

### Lazy Loading
- **Dynamic imports** per componenti pesanti
- **Code splitting** per bundle optimization

## Sicurezza

### Sanitizzazione
- **Input validation** per dati utente
- **XSS prevention** con escape automatico di React
- **Data validation** prima del salvataggio

### LocalStorage
- **Try-catch** per operazioni localStorage
- **Fallback** per dati corrotti
- **Cleanup** per dati obsoleti


PROJECT_STRUCTURE.MD :

# Struttura del Progetto HACCP

## Root Directory
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


## Source Directory (/src/)

### File Principali
- **App.jsx** - Componente principale dell'applicazione, gestisce routing e stato globale
- **main.jsx** - Entry point dell'applicazione, configura React e service worker
- **index.css** - Stili globali e configurazione Tailwind

### Components (/src/components/)
**Componenti UI Base:**
- ui/Button.jsx - Componente bottone riutilizzabile
- ui/Card.jsx - Componente card per contenitori
- ui/Input.jsx - Componente input personalizzato
- ui/Label.jsx - Componente label per form
- ui/Tabs.jsx - Sistema di tab per navigazione
- ui/TemperatureInput.jsx - Input specializzato per temperature

**Componenti Funzionali Principali:**
- Dashboard.jsx - Dashboard principale con statistiche
- OnboardingWizard.jsx - Wizard di configurazione iniziale
- Login.jsx - Sistema di autenticazione utenti
- PuntidiConservazione.jsx - Gestione frigoriferi e temperature
- Cleaning.jsx - Gestione attività e mansioni staff
- Inventory.jsx - Gestione inventario prodotti
- ProductLabels.jsx - Gestione etichette prodotti
- AIAssistant.jsx - Assistente IA per supporto
- AIAssistantSection.jsx - Sezione dedicata IA
- DataSettings.jsx - Impostazioni e configurazioni
- Gestione.jsx - Gestione staff e utenti (admin only)

**Componenti di Supporto:**
- DevModeBanner.jsx - Banner per modalità sviluppo
- PWAInstallPrompt.jsx - Prompt installazione PWA
- PDFExport.jsx - Esportazione report PDF
- StorageManager.jsx - Gestione storage dati
- SyncManager.jsx - Sincronizzazione cloud
- NotificationSystem.jsx - Sistema notifiche
- BackupPanel.jsx - Pannello backup/restore

**Componenti Onboarding (/onboarding-steps/):**
- BusinessInfoStep.jsx - Step informazioni azienda
- DepartmentsStep.jsx - Step configurazione reparti
- ConservationStep.jsx - Step punti di conservazione
- StaffStep.jsx - Step configurazione staff
- TasksStep.jsx - Step attività e mansioni
- InventoryStep.jsx - Step inventario iniziale

**Componenti Automazione (/automations/):**
- ExpiryAlertAutomation.jsx - Automazione alert scadenze

### Services (/src/services/)
- **dataService.js** - Servizio per gestione dati locali
- **supabaseService.js** - Servizio per operazioni Supabase/cloud

### Hooks (/src/hooks/)
- **useHaccpData.js** - Hook per gestione dati HACCP
- **useCan.js** - Hook per controllo permessi

### Utils (/src/utils/)
- **dataSchemas.js** - Schemi dati e validazione
- **haccpRules.js** - Regole HACCP e validazioni
- **haccpGuide.js** - Guida e documentazione HACCP
- **permissions.js** - Sistema permessi e ruoli
- **devMode.js** - Gestione modalità sviluppo
- **cloudSimulator.js** - Simulatore servizi cloud
- **firebase.js** - Configurazione Firebase
- **presetService.js** - Servizio preset attività
- **temperatureDatabase.js** - Database temperature
- **useHaccpValidation.js** - Validazioni HACCP

### Lib (/src/lib/)
- **supabase.js** - Configurazione client Supabase

## Public Directory (/public/)
- **manifest.json** - Manifest PWA
- **sw.js** - Service Worker
- **favicon.ico** - Icona favicon
- **icons/** - Icone PWA (128x128, 144x144, 152x152, 192x192, 384x384, 512x512, 72x72, 96x96)
- **assets/help/fridge/** - Asset di supporto per frigoriferi

## Docs Directory (/docs/)
- **Build output** per deploy su GitHub Pages
- **Asset files** con hash per cache busting
- **Static files** per PWA

## Reports Directory (/reports/)
- **templates/** - Template per report HACCP
- **HACCP_Report_Modello_Vuoto.txt** - Template report vuoto

## File di Configurazione

### Build e Deploy
- **vite.config.js** - Configurazione Vite (build, dev server, output)
- **tailwind.config.js** - Configurazione Tailwind CSS (temi, colori)
- **postcss.config.js** - Configurazione PostCSS
- **netlify.toml** - Configurazione deploy Netlify
- **vercel.json** - Configurazione deploy Vercel
- **vercel-beta.json** - Configurazione deploy beta

### Package Management
- **package.json** - Dipendenze, script, metadati progetto
- **package-lock.json** - Lock file dipendenze
- **requirements.txt** - Dipendenze Python (per script ausiliari)

## File di Documentazione
- **README.md** - Documentazione principale
- **HACCP_APP_DOCUMENTATION.md** - Documentazione specifica HACCP
- **AGENT_DIRECTIVES.md** - Direttive per agenti AI
- **DEPLOY_README.md** - Guida deploy
- **PWA_INSTALLATION_GUIDE.md** - Guida installazione PWA
- **UX_UI_AUDIT_REPORT.md** - Report audit UX/UI
- ***.md** - Altri file di documentazione e guide

## File di Test e Debug
- **test-*.html** - File HTML per test specifici
- **quick-fix.html** - File per fix rapidi
- **fix-localstorage.html** - Fix per problemi localStorage
- **ram_monitor.py** - Script Python per monitoraggio RAM
- **avvia_monitor_ram.bat** - Script batch per avvio monitor

## Backup e Versioning
- **src_backup_20250903_223246/** - Backup completo del codice sorgente
- **.git/** - Repository Git (nascosto)
- **File di commit** - Documentazione modifiche e fix

## Struttura Dati LocalStorage
- **haccp-*** - Prefisso per tutti i dati HACCP
- **haccp-users** - Utenti e autenticazione
- **haccp-departments** - Reparti aziendali
- **haccp-staff** - Personale e ruoli
- **haccp-refrigerators** - Punti di conservazione
- **haccp-temperatures** - Registrazioni temperature
- **haccp-cleaning** - Attività e mansioni
- **haccp-products** - Inventario prodotti
- **haccp-product-labels** - Etichette prodotti
- **haccp-onboarding** - Dati onboarding
- **haccp-dev-mode** - Configurazione modalità sviluppo


KEY_CONCEPT.MD :



<FINE FILE DI CUR# Concetti Fondamentali del Progetto HACCP

## Entità Principali

### User (Utente)
javascript
{
  id: string,           // ID univoco utente
  name: string,         // Nome utente
  pin: string,          // PIN di accesso
  role: 'admin' | 'dipendente' | 'responsabile' | 'collaboratore',
  department: string,   // Reparto di appartenenza
  createdAt: string,    // Data creazione (ISO)
  isActive: boolean     // Stato attivo
}


### Department (Reparto)
javascript
{
  id: string,           // ID univoco reparto
  name: string,         // Nome reparto
  description: string,  // Descrizione
  location: string,     // Ubicazione fisica
  manager: string,      // Responsabile
  notes: string,        // Note aggiuntive
  enabled: boolean,     // Stato attivo
  isCustom: boolean,    // Se creato dall'utente
  createdAt: string,    // Data creazione
  createdBy: string     // Creato da
}


### Conservation Point (Punto di Conservazione)
javascript
{
  id: string,                    // ID univoco
  name: string,                  // Nome (es. "Frigo A")
  location: string,              // Ubicazione
  targetTemp: number,            // Temperatura target (°C)
  selectedCategories: string[],  // Categorie prodotti compatibili
  compliance: {                  // Stato conformità HACCP
    isValid: boolean,
    errors: string[],
    warnings: string[]
  },
  createdAt: string
}


### Product (Prodotto)
javascript
{
  id: string,           // ID univoco prodotto
  name: string,         // Nome prodotto
  type: string,         // Categoria prodotto
  expiryDate: string,   // Data scadenza (YYYY-MM-DD)
  position: string,     // Posizione conservazione
  allergens: string[],  // Allergeni presenti
  createdAt: string,    // Data aggiunta
  addedDate: string     // Data aggiunta (formato locale)
}


### Temperature Record (Registrazione Temperatura)
javascript
{
  id: string,           // ID univoco
  refrigeratorId: string, // ID frigorifero
  temperature: number,   // Temperatura rilevata
  timestamp: string,     // Data/ora rilevamento
  status: 'ok' | 'warning' | 'danger', // Stato temperatura
  recordedBy: string,    // Operatore che ha rilevato
  notes: string         // Note aggiuntive
}


### Cleaning Task (Attività di Pulizia)
javascript
{
  id: string,           // ID univoco
  name: string,         // Nome attività
  assignedRole: string, // Ruolo assegnato
  assignedEmployee: string, // Dipendente assegnato
  frequency: string,    // Frequenza (Giornalmente, Settimanalmente, etc.)
  priority: 'Alta' | 'Media' | 'Bassa',
  completed: boolean,   // Stato completamento
  notes: string,        // Note
  createdAt: string,    // Data creazione
  completedAt: string   // Data completamento
}


### Staff Member (Membro Staff)
javascript
{
  id: string,           // ID univoco
  name: string,         // Nome completo
  fullName: string,     // Nome completo
  role: string,         // Ruolo (Amministratore, Responsabile, etc.)
  categories: string[], // Categorie di appartenenza
  certification: string, // Certificazioni HACCP
  notes: string,        // Note
  addedDate: string,    // Data aggiunta
  addedTime: string,    // Ora aggiunta
  isRegisteredUser: boolean, // Se è utente registrato
  userId: string        // ID utente associato
}


## Logica di Business

### Sistema HACCP
Il progetto implementa un sistema di gestione HACCP (Hazard Analysis and Critical Control Points) per ristoranti e attività alimentari, con focus su:

1. **Controllo Temperature**: Monitoraggio continuo delle temperature di conservazione
2. **Tracciabilità**: Registrazione completa di prodotti, fornitori e movimenti
3. **Formazione Staff**: Gestione certificazioni e competenze del personale
4. **Pulizia e Sanificazione**: Programmazione e controllo delle attività di pulizia
5. **Compliance Normativa**: Rispetto delle normative italiane HACCP

### Validazione Automatica
- **Compatibilità Prodotti-Frigoriferi**: Verifica automatica che i prodotti siano conservati nei punti di temperatura appropriata
- **Prevenzione Contaminazioni**: Controllo che non vengano mescolate categorie incompatibili
- **Alert Scadenze**: Notifiche automatiche per prodotti in scadenza
- **Controllo Accessi**: Sistema di permessi basato su ruoli

### Onboarding Sequenziale
Il sistema richiede una configurazione iniziale obbligatoria:
1. **Informazioni Azienda**: Dati anagrafici e fiscali
2. **Reparti**: Almeno un reparto operativo
3. **Punti di Conservazione**: Almeno un frigorifero/freezer
4. **Staff**: Almeno un membro del personale
5. **Attività**: Configurazione mansioni e responsabilità
6. **Inventario**: Setup iniziale prodotti

### Gestione Stato
- **LocalStorage**: Persistenza dati locale per funzionamento offline
- **Supabase**: Sincronizzazione cloud per backup e multi-device
- **Context API**: Gestione stato globale React
- **Custom Hooks**: Logica riutilizzabile per operazioni dati

### Sistema Multi-tenant
- **Company ID**: Identificazione univoca per ogni azienda
- **Isolamento Dati**: Separazione completa dei dati tra aziende
- **Configurazione Personalizzata**: Ogni azienda può configurare reparti, ruoli e processi

## Regole HACCP Implementate

### Categorie Prodotti
javascript
const CONSERVATION_POINT_RULES = {
  categories: [
    { id: 'fresh_meat', name: 'Carne Fresca', minTemp: 0, maxTemp: 4 },
    { id: 'fresh_fish', name: 'Pesce Fresco', minTemp: 0, maxTemp: 2 },
    { id: 'fresh_dairy', name: 'Latticini Freschi', minTemp: 2, maxTemp: 4 },
    { id: 'fresh_vegetables', name: 'Verdure Fresche', minTemp: 2, maxTemp: 8 },
    { id: 'frozen', name: 'Surgelati', minTemp: -18, maxTemp: -15 },
    { id: 'cooked', name: 'Cibi Cotti', minTemp: 60, maxTemp: 65 }
  ],
  tolerance: 2 // Tolleranza in gradi
}


### Controllo Accessi
- **Admin**: Accesso completo a tutte le funzionalità
- **Responsabile**: Accesso limitato alle sezioni operative
- **Dipendente**: Accesso solo alle funzionalità assegnate
- **Collaboratore**: Accesso minimo per attività specifiche

### Validazioni Critiche
1. **Temperature**: Controllo che le temperature siano nei range HACCP
2. **Scadenze**: Alert per prodotti in scadenza
3. **Compatibilità**: Verifica che i prodotti siano conservati correttamente
4. **Formazione**: Controllo che il personale sia certificato
5. **Pulizia**: Verifica che le attività di sanificazione siano completate

## Architettura Tecnica

### Pattern Utilizzati
- **Component Composition**: Composizione di componenti per funzionalità complesse
- **Custom Hooks**: Logica riutilizzabile per gestione dati
- **Service Layer**: Separazione tra logica business e presentazione
- **Schema Validation**: Validazione dati con schemi definiti
- **Error Boundaries**: Gestione errori a livello di componente

### Persistenza Dati
- **LocalStorage**: Dati locali per funzionamento offline
- **Supabase**: Database cloud per sincronizzazione
- **Migration System**: Sistema di migrazione da locale a cloud
- **Backup/Restore**: Funzionalità di backup e ripristino

### Performance
- **Lazy Loading**: Caricamento on-demand dei componenti
- **Memoization**: Ottimizzazione re-rendering con useCallback/useMemo
- **Code Splitting**: Divisione del bundle per ottimizzazione
- **PWA**: Funzionalità offline e installazione app

## Sicurezza e Compliance

### Validazione Dati
- **Input Sanitization**: Pulizia input utente
- **Schema Validation**: Validazione struttura dati
- **Type Checking**: Controllo tipi JavaScript
- **Error Handling**: Gestione errori robusta

### Audit Trail
- **Log Azioni**: Registrazione di tutte le azioni critiche
- **Tracciabilità**: Collegamento azioni-utente-timestamp
- **Backup Automatico**: Salvataggio periodico dei dati
- **Versioning**: Controllo versioni per rollback

### Privacy e GDPR
- **Consenso Utente**: Gestione consensi per trattamento dati
- **Anonimizzazione**: Possibilità di anonimizzare dati sensibili
- **Export Dati**: Funzionalità di esportazione per portabilità
- **Cancellazione**: Procedure per cancellazione dati utente

CURRENT_GOAL.MD : 
# Obiettivo Corrente del Progetto HACCP

## OBIETTIVO CORRENTE
*[Da aggiornare manualmente - Descrivere l'obiettivo principale attuale del progetto]*

**Data Aggiornamento**: [YYYY-MM-DD]  
**Priorità**: [Alta/Media/Bassa]  
**Stato**: [In Corso/Completato/In Pausa/Bloccato]

### Descrizione
*[Descrivere in dettaglio l'obiettivo corrente, cosa si sta cercando di raggiungere]*

### Contesto
*[Fornire il contesto necessario per comprendere l'obiettivo]*

### Criteri di Successo
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

---

## FUNZIONALITÀ IN SVILUPPO
*[Da aggiornare manualmente - Elencare le funzionalità attualmente in sviluppo]*

### Funzionalità 1
**Stato**: [In Sviluppo/Testing/Review/Completata]  
**Priorità**: [Alta/Media/Bassa]  
**Sprint/Iterazione**: [Numero o nome]

**Descrizione**: *[Breve descrizione della funzionalità]*

**Progresso**: 
- [ ] Task 1
- [ ] Task 2
- [x] Task 3 (completato)

**Note**: *[Note aggiuntive, problemi, dipendenze]*

### Funzionalità 2
**Stato**: [In Sviluppo/Testing/Review/Completata]  
**Priorità**: [Alta/Media/Bassa]  
**Sprint/Iterazione**: [Numero o nome]

**Descrizione**: *[Breve descrizione della funzionalità]*

**Progresso**: 
- [ ] Task 1
- [ ] Task 2
- [x] Task 3 (completato)

**Note**: *[Note aggiuntive, problemi, dipendenze]*

---

## PROSSIMI TASK
*[Da aggiornare manualmente - Elencare i prossimi task da completare]*

### Task Immediati (Prossimi 1-3 giorni)
- [ ] **Task 1**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

- [ ] **Task 2**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

### Task a Breve Termine (Prossima settimana)
- [ ] **Task 3**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

- [ ] **Task 4**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

### Task a Medio Termine (Prossime 2-4 settimane)
- [ ] **Task 5**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

---

## BLOCCHI E PROBLEMI
*[Da aggiornare manualmente - Elencare i blocchi attuali]*

### Blocco 1
**Descrizione**: *[Descrizione del problema o blocco]*

**Impatto**: [Alto/Medio/Basso]

**Azioni Richieste**: 
- [ ] Azione 1
- [ ] Azione 2

**Responsabile**: [Nome o ruolo]

**Data Identificazione**: [YYYY-MM-DD]

### Blocco 2
**Descrizione**: *[Descrizione del problema o blocco]*

**Impatto**: [Alto/Medio/Basso]

**Azioni Richieste**: 
- [ ] Azione 1
- [ ] Azione 2

**Responsabile**: [Nome o ruolo]

**Data Identificazione**: [YYYY-MM-DD]

---

## RISORSE E DIPENDENZE
*[Da aggiornare manualmente - Elencare risorse e dipendenze]*

### Risorse Umane
- **Sviluppatore**: [Nome/Ruolo] - [Disponibilità]
- **Designer**: [Nome/Ruolo] - [Disponibilità]
- **Tester**: [Nome/Ruolo] - [Disponibilità]

### Risorse Tecniche
- **Ambiente di Sviluppo**: [Descrizione]
- **Ambiente di Test**: [Descrizione]
- **Ambiente di Produzione**: [Descrizione]

### Dipendenze Esterne
- **API**: [Nome servizio] - [Stato]
- **Librerie**: [Nome libreria] - [Versione]
- **Servizi**: [Nome servizio] - [Stato]

---

## METRICHE E KPI
*[Da aggiornare manualmente - Definire metriche di successo]*

### Metriche Tecniche
- **Performance**: [Valore target]
- **Uptime**: [Valore target]
- **Error Rate**: [Valore target]
- **Load Time**: [Valore target]

### Metriche Funzionali
- **Utenti Attivi**: [Valore target]
- **Funzionalità Utilizzate**: [Valore target]
- **Soddisfazione Utente**: [Valore target]

### Metriche HACCP
- **Compliance Rate**: [Valore target]
- **Temperature Monitoring**: [Valore target]
- **Audit Success**: [Valore target]

---

## NOTE E OSSERVAZIONI
*[Da aggiornare manualmente - Note aggiuntive]*

### Note Generali
*[Note generali sul progetto, osservazioni, lezioni apprese]*

### Note Tecniche
*[Note tecniche specifiche, architettura, decisioni tecniche]*

### Note HACCP
*[Note specifiche per compliance HACCP, normative, best practices]*

---

**Ultimo Aggiornamento**: [YYYY-MM-DD HH:MM]  
**Aggiornato da**: [Nome]  
**Prossima Revisione**: [YYYY-MM-DD]






**ISTRUZIONI OPERATIVE:**

1.  **Fondi e Migliora:** Crea una versione *definitiva* di ogni file. Integra i dettagli più fini della tua analisi precedente (ad esempio, gli schemi dati completi, le versioni precise delle librerie, la struttura esatta delle cartelle) con la struttura di base dei file di Cursor.
2.  **Formato di Output:** Restituisci **solo e soltanto** i blocchi di codice Markdown proni per essere salvati. Precedi ogni blocco con un commento che indica il nome del file.
3.  **Sii iper-dettagliato e operativo:** L'LLM che leggerà questi file deve poter capire *esattamente* come è strutturato il progetto, quali sono i suoi data model e quali convenzioni seguire. Includi esempi di codice dove rilevante (es. gli schemi degli oggetti TemperatureRecord o Product).
4.  **Priorità alla Tua Analisi:** Se noti discrepanze tra la tua analisi precedente e i file di Cursor, da' sempre precedenza alla tua analisi, che è più approfondita.

**FILE DA GENERARE:**
Genera i seguenti file, con questo livello di dettaglio:

1.  **tech_stack.md:** Deve includere versioni specifiche (es. React 18.2.0), strumenti di build (Vite + plugin), il dettaglio che jsPDF è caricato via CDN e l'assenza di TypeScript.
2.  **code_style_rules.md:** Deve includere le convenzioni di naming, l'uso degli apostrofi singoli, la destrutturazione obbligatoria, e il naming degli hook personalizzati (e.g., useCan).
3.  **project_structure.md:** **DEVE** essere la mappa dettagliata delle cartelle che hai prodotto nella tua analisi, che è di gran lunga superiore a quella generata da Cursor.
4.  **key_concepts.md:** Deve includere gli schemi dei dati completi (per Temperature, Cleaning, Product, ecc.) e le logiche di business principali (multi-tenant, validazione onboarding, flusso di persistenza).
5.  **current_goal.md:** Mantieni il template generato da Cursor, è un buono punto di partenza.

**INIZIA IL PROCESSO DI FUSIONE E CREAZIONE DELLA DOCUMENTAZIONE DEFINITIVA.**
ChatGPT ha detto:

Ragionato per 15s
<!-- tech_stack.md -->
# Tech Stack — Business HACCP Manager

> **Sintesi:** SPA React + Vite, JavaScript (no TypeScript), TailwindCSS, PWA (manifest + Service Worker), persistenza locale via `LocalStorage` orchestrata da un **DataService** unificato; integrazioni cloud predisposte (Supabase/Firebase) ma **non** vincolanti ai flussi principali. Export PDF tramite **jsPDF caricato via CDN** in `index.html`.

---

## Runtime & Build

- **Node.js**: ≥ 18 LTS (consigliato 18.x)
- **npm**: ≥ 9
- **Vite**: `4.4.5`
  - **@vitejs/plugin-react**: `4.0.3`
- **React**: `18.2.0`
- **react-dom**: `18.2.0`

### Script npm (estratto)
- `dev`: avvio dev server Vite
- `build`: build produzione (output per `docs/`)
- `preview`: anteprima build
- `lint`: ESLint

---

## Linguaggio

- **JavaScript (ES2020+)**
- **Assenza di TypeScript**: *non* presente `tsconfig.json`, *non* presente `typescript` in `devDependencies`.

---

## UI & Styling

- **Tailwind CSS**: `3.3.3`
- **PostCSS**: `8.4.27`
- **Autoprefixer**: `10.4.14`
- **Lucide React** (icone): `0.263.1`
- Stili globali in `src/index.css`
- Componenti UI basilari in `src/components/ui/` (Button, Card, Input, Label, Tabs, ecc.)

---

## PWA / Offline

- **Web App Manifest**: `public/manifest.json`
- **Service Worker**: `public/sw.js` *(presente anche una copia in root per compatibilità storica)*
- **Gestione SW in dev**: funzione `disableExistingServiceWorker()` in `src/main.jsx` per deregistrare SW preesistenti durante lo sviluppo.

---

## Persistenza Dati

- **LocalStorage** (prefisso chiavi `haccp-*`)
- **DataService** (`src/services/dataService.js`):
  - parsing/serializzazione sicura
  - validazioni base + messaggi user-friendly
  - merge/migrazioni/sanity checks
  - cleanup/backup automatici
- **Context/State**: gestione stato centralizzata in `App.jsx` (no `react-router-dom`; navigazione per *tab/stati interni*).

---

## Integrazioni Cloud (non-bloccanti)

- **Supabase**:
  - client in `src/lib/supabase.js` (richiede `.env`)
  - wrapper in `src/services/supabaseService.js` con metodi nominali (es. `saveCleaningData`, `saveInventoryData`, `linkProductToLabel`, …) oggi **placeholder** con gating su `companyId`
- **Firebase**:
  - presenza in `package.json`
  - config placeholder in `src/utils/firebase.js`
- **Sync UI simulata**: `components/SyncManager.jsx` (barre progresso, stato online/offline, tipologie dati)

---

## PDF / Reporting

- **jsPDF**: `3.0.1` **via CDN** caricato in `index.html`
  - integrazione in `components/PDFExport.jsx`
  - *Nota*: nessuna importazione via npm per jsPDF; si assume presenza globale fornita dal `<script>` CDN.

---

## Linting & Qualità

- **ESLint**: `8.45.0`
- **eslint-plugin-react**: `7.32.2`
- **eslint-plugin-react-hooks**: `4.6.0`
- **eslint-plugin-react-refresh**: `0.4.3`

---

## Decisioni Architetturali Chiave

- **SPA senza routing**: tab gestite in `App.jsx` con `activeTab`
- **Modularità per feature**: cartella `src/components/` raggruppa moduli funzionali (Temperature, Cleaning, Inventory, Suppliers, ProductLabels, Onboarding, NotificationSystem, Backup/Export, Sync)
- **PWA-first**: funzionamento offline, install prompt custom
- **Multi-tenant predisposto**: gating su `companyId` laddove rilevante; *isolation* logico nei servizi cloud (ancora non attivo sui flussi critici)
<!-- code_style_rules.md -->
# Regole di Stile e Convenzioni

> **Obiettivo:** massimizzare leggibilità, prevedibilità e sicurezza nei moduli HACCP critici.

---

## Naming & Struttura File

- **Componenti React**: `PascalCase` — `Dashboard.jsx`, `OnboardingWizard.jsx`, `Temperature.jsx`
- **File = Componente** (1:1; eccezioni solo per *ui* micro-componenti)
- **UI base** in `src/components/ui/` — `Button.jsx`, `Card.jsx`, `Input.jsx`, `Label.jsx`, `Tabs.jsx`, `TemperatureInput.jsx`
- **Hook personalizzati**: prefisso `use` — `useHaccpData`, `useCan`, `useHaccpValidation`
- **Servizi** in `src/services/` — `dataService.js`, `supabaseService.js`
- **Utility** in `src/utils/` — `haccpRules.js`, `temperatureDatabase.js`, `permissions.js`, `presets.js`

### Variabili & Funzioni
- **camelCase** per variabili e funzioni: `currentUser`, `handleSave`, `setTemperatures`
- **Costanti**: `SCREAMING_SNAKE_CASE` per chiavi/localStorage/schemi: `HACCP_KEYS`, `CONSERVATION_POINT_RULES`
- **Schemi/Tipi JS Doc**: `PascalCase` — `TemperatureRecord`, `CleaningTask`

---

## Stile JavaScript / JSX

- **Apostrofi singoli** per stringhe: `'haccp-temperatures'`
- **Template literal** per interpolazione: `` `Ciao, ${user.name}` ``
- **Indentazione**: 2 spazi
- **Import order**:
  1. React & librerie esterne
  2. Componenti interni
  3. Servizi/Utils
  4. Stili
- **Props**: *destructuring obbligatorio* `{ temperatures, currentUser }`
- **Default props/parametri** dove sensato: `{ items = [] }`
- **Self-closing** tags quando possibile: `<Thermometer className='h-4 w-4' />`
- **Conditional rendering** con operatori chiari:
  - short-circuit: `{isAdmin && <AdminPanel/>}`
  - ternario per biforcazioni semplici

---

## Stato & Effetti

- **useState**: nomi `value`/`setValue`; *functional updates* per dipendenze
- **useEffect**: *sempre* dependency array; cleanup per listener/timeouts
- **Memoization**: `useCallback` per funzioni passate a figli; `useMemo` per calcoli pesanti
- **React.StrictMode**: attivo in `main.jsx` (double-invoke effetti *dev* safe)

---

## Error Handling & Validazione

- **Try/Catch** per IO (LocalStorage, Supabase, PDF)
- **Logging**: `console.warn` per degrado, `console.error` per errori bloccanti
- **Fallback resilienti**: `safeParse(json, fallback = [])`
- **Validazioni**:
  - **Schema-level** su dati critici (Temperature, Cleaning, Inventory)
  - **Type checking** leggero (`typeof`, Array.isArray)
  - **Nullish coalescing**: `value ?? defaultValue`
- **Messaggi utente**: *chiari e azionabili* (es. “Formato data non valido: usa AAAA-MM-GG”)

---

## Documentazione & Commenti

- **JSDoc** in testa ai file critici:
  - `@fileoverview` descrizione
  - `@critical` per punti HACCP sensibili
  - `@version` per revisioni rilevanti
- **Inline comments** per logiche non ovvie
- **TODO / FIXME**: tracciabili e mirati (evitare TODO generici)

---

## Performance

- **Code splitting** solo per moduli pesanti in futuro (lazy)
- **Avoid re-render**: `React.memo` sui componenti puramente presentazionali ad alta frequenza
- **Liste**: key stabili basate su `id` persistente

---

## Sicurezza & Compliance

- **Sanitizzazione input** lato UI (trim, whitelist) + validazioni DataService
- **LocalStorage**: tutte le operazioni in `dataService.js` con *try/catch* e fallback
- **XSS**: evitare `dangerouslySetInnerHTML`; se indispensabile, sanificare prima
- **Audit Trail**: azioni rilevanti registrate in `haccp-actions` (operatore/timestamp)

---

## Convenzioni UX Minime

- Azioni distruttive con conferma esplicita
- Stati `ok | warning | danger` uniformi in badge/icone
- Feedback immediato su salvataggi (toast/banner)
<!-- project_structure.md -->
# Struttura del Progetto

Business-HACCP-manager/
├─ public/ # Asset PWA e statici
│ ├─ manifest.json # Web App Manifest
│ ├─ sw.js # Service Worker (PWA)
│ ├─ icons/ # Icone PWA (72..512)
│ └─ assets/
│ └─ help/
│ └─ fridge/ # Diagrammi/immagini guida frigo/freezer
│
├─ src/
│ ├─ components/ # Moduli funzionali + UI basilare
│ │ ├─ ui/ # Libreria UI minimale
│ │ │ ├─ Button.jsx
│ │ │ ├─ Card.jsx
│ │ │ ├─ Input.jsx
│ │ │ ├─ Label.jsx
│ │ │ ├─ Tabs.jsx
│ │ │ └─ TemperatureInput.jsx
│ │ ├─ Dashboard.jsx
│ │ ├─ Temperature.jsx
│ │ ├─ Refrigerators_backup.jsx # Gestione punti conservazione (storico/backup)
│ │ ├─ HelpOverlay.jsx # Overlay guida con diagrammi scaffali
│ │ ├─ Departments.jsx
│ │ ├─ DepartmentManager.jsx
│ │ ├─ Cleaning.jsx
│ │ ├─ CleaningDepartments.jsx
│ │ ├─ Inventory.jsx
│ │ ├─ Suppliers.jsx
│ │ ├─ ProductLabels.jsx
│ │ ├─ StorageManager.jsx
│ │ ├─ NotificationSystem.jsx
│ │ ├─ AdvancedReporting.jsx
│ │ ├─ PDFExport.jsx # Usa jsPDF da CDN (index.html)
│ │ ├─ BackupPanel.jsx # Export/Import JSON, backup data
│ │ ├─ SyncManager.jsx # Simulazione Sync cloud (UI/logica)
│ │ ├─ AIAssistant.jsx
│ │ ├─ AIAssistantSection.jsx
│ │ └─ onboarding-steps/ # Wizard onboarding (step sequenziali)
│ │ ├─ OnboardingWizard.jsx
│ │ ├─ BusinessInfoStep.jsx
│ │ ├─ DepartmentsStep.jsx
│ │ ├─ ConservationStep.jsx
│ │ ├─ StaffStep.jsx
│ │ ├─ TasksStep.jsx
│ │ └─ InventoryStep.jsx
│ │
│ ├─ hooks/
│ │ ├─ useHaccpData.js # Accesso centralizzato ai dati HACCP
│ │ └─ useCan.js # Permessi/ruoli
│ │
│ ├─ lib/
│ │ └─ supabase.js # Factory client Supabase (richiede .env)
│ │
│ ├─ services/
│ │ ├─ dataService.js # CRUD LocalStorage + migrazioni/validazioni
│ │ └─ supabaseService.js # Wrapper metodi cloud (placeholder/gating companyId)
│ │
│ ├─ utils/
│ │ ├─ haccpRules.js # Regole HACCP (range temp, compatibilità, ecc.)
│ │ ├─ temperatureDatabase.js # Soglie/suggerimenti per tipo frigo/categoria
│ │ ├─ permissions.js # Ruoli e mapping capacità
│ │ ├─ presets.js # Preset attività/reparti iniziali
│ │ ├─ useHaccpValidation.js # Validazioni step-by-step onboarding
│ │ └─ firebase.js # Config placeholder Firebase
│ │
│ ├─ App.jsx # Stato globale, orchestrazione tab/sezioni
│ ├─ main.jsx # Bootstrap React + disabilitazione SW in dev
│ └─ index.css # Tailwind base + stili globali/banner/toast
│
├─ docs/ # Output build (es. GitHub Pages)
├─ index.html # Entry HTML (font, manifest, jsPDF via CDN)
├─ vite.config.js # Config Vite (build/output/aliases)
├─ tailwind.config.js # Tema/estensioni Tailwind
├─ postcss.config.js # PostCSS + Autoprefixer
├─ vercel.json # Config deploy Vercel (prod/beta)
├─ vercel-beta.json # (opzionale) canale beta
├─ netlify.toml # (opzionale) config Netlify
├─ .md # Documentazione interna
└─ test-.html # QA manuale / prove isolate


> **Nota Navigazione:** non è presente `react-router-dom`. La navigazione avviene tramite stato locale (`activeTab`) centralizzato in `App.jsx`.

> **Nota PWA:** esiste una **copia** del `sw.js` anche in root per compatibilità storica; la versione effettiva usata in produzione si trova in `public/sw.js`.

<!-- key_concepts.md -->
# Concetti Fondamentali & Data Model

> Questa sezione è la fonte di verità per oggetti, chiavi di persistenza, logiche di conformità e flussi.

---

## Chiavi di Persistenza (LocalStorage)

Prefisso: **`haccp-*`** — gestite **solo** tramite `DataService`.

```js
// Estratto da KEYS (DataService)
{
  'haccp-app-data': {...},        // meta applicativa/versioni/migrazioni
  'haccp-users': [...],
  'haccp-current-user': {...},

  'haccp-business-info': {...},
  'haccp-business-data': {...},

  'haccp-departments': [...],
  'haccp-departments-v2': [...],

  'haccp-refrigerators': [...],
  'haccp-refrigerators-v2': [...],

  'haccp-temperatures': [...],

  'haccp-staff': [...],

  'haccp-cleaning': [...],
  'haccp-cleaning-departments': [...],

  'haccp-inventory': [...],
  'haccp-orders': [...],
  'haccp-inventory-products': [...],

  'haccp-suppliers': [...],

  'haccp-actions': [...],         // audit trail
  'haccp-notifications': [...],   // deduplicazione su (type + dataId)

  'haccp-product-labels': [...],
  'haccp-label-groups': [...],

  'haccp-onboarding': {...},

  'haccp-presets': {...}
}
Entità & Schemi
Gli schemi sono rappresentativi; la validazione completa avviene in DataService + utils/haccpRules.js.

Utente (User)
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt         // ISO
 * @property {boolean} isActive
 * @property {string=} companyId        // per multi-tenant in cloud
 */
Reparto (Department)
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt         // ISO
 * @property {string} createdBy         // userId
 */
Punto di Conservazione (ConservationPoint)
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name              // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
Registrazione Temperatura (TemperatureRecord)
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id         // timestamp o uuid
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // nome umano ("Frigo A")
 * @property {string} location          // es. "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator          // nome operatore
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio valido

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
Task Pulizia (CleaningTask)
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee          // id utente o reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa' (prossima scadenza/assegnazione)
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
Prodotto Inventario (Product)
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate        // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId
 * @property {string} createdAt         // ISO
 */
Esempio (estratto dal form)

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
Fornitore (Supplier)
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
Etichetta Prodotto (ProductLabel)
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode             // (opzionale) dati per QR
 * @property {string} createdAt
 * @property {string} expiresAt          // se applicabile
 * @property {boolean} archived
 */
Notifica (Notification)
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId             // id entità correlata
 * @property {string} createdAt
 * @property {boolean} read
 */
Regole HACCP (estratto operativo)
Range Temperature per categoria/punto (in utils/temperatureDatabase.js)

esempio categorie:

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules

Compatibilità: prevenzione mescolanza categorie incompatibili nello stesso punto

Status (ok|warning|danger): derivato dal confronto value vs range + tolleranza

Schedulazione Pulizie: frequency determina prossimi task; mancate esecuzioni → warning

Onboarding & Validazioni
Wizard step-by-step (in components/onboarding-steps/):

BusinessInfo → dati aziendali (possibile geocoding OSM/Nominatim se disponibile)

Departments → definizione/attivazione reparti (alcuni predefiniti e non eliminabili)

Conservation → punti di conservazione (tipo, soglie, categorie)

Staff → membri e ruoli

Tasks → mansioni iniziali (pulizie/operatività)

Inventory → seed inventario

Gating: avanzamento condizionato da useHaccpValidation + haccpRules; stato “confermato/non confermato” per sezione.

Flusso di Persistenza
UI (componenti feature) → invocano DataService per read/write.

DataService:

valida input

migra/mergia dati se necessario

aggiorna LocalStorage

registra action in haccp-actions

Sync (Simulato):

SyncManager opzionalmente chiama supabaseService (placeholder)

gating su companyId, gestione esiti/errore

Backup/Export:

BackupPanel produce haccp-backup-YYYY-MM-DD.json

Import con validazione schema minima

Notifiche & De-dup
NotificationSystem genera alert su:

temperature fuori range

scadenze imminenti (inventario/etichette)

pulizie non eseguite

De-dup: chiave di unicità (type + dataId)

Access Control
Hook useCan valuta capacità in base a:

ruolo (admin, responsabile, dipendente, collaboratore)

reparto e ownership dati

Azioni critiche (delete, export, sync) richiedono permessi elevati.

PWA Considerazioni
Cache offline gestita da sw.js

Prompt installazione personalizzato (componente dedicato)

In dev: main.jsx deregistra SW preesistenti per evitare cache incoerente


<!-- current_goal.md -->
```markdown
# Obiettivo Corrente del Progetto HACCP

## OBIETTIVO CORRENTE
*[Da aggiornare manualmente - Descrivere l'obiettivo principale attuale del progetto]*

**Data Aggiornamento**: [YYYY-MM-DD]  
**Priorità**: [Alta/Media/Bassa]  
**Stato**: [In Corso/Completato/In Pausa/Bloccato]

### Descrizione
*[Descrivere in dettaglio l'obiettivo corrente, cosa si sta cercando di raggiungere]*

### Contesto
*[Fornire il contesto necessario per comprendere l'obiettivo]*

### Criteri di Successo
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

---

## FUNZIONALITÀ IN SVILUPPO
*[Da aggiornare manualmente - Elencare le funzionalità attualmente in sviluppo]*

### Funzionalità 1
**Stato**: [In Sviluppo/Testing/Review/Completata]  
**Priorità**: [Alta/Media/Bassa]  
**Sprint/Iterazione**: [Numero o nome]

**Descrizione**: *[Breve descrizione della funzionalità]*

**Progresso**: 
- [ ] Task 1
- [ ] Task 2
- [x] Task 3 (completato)

**Note**: *[Note aggiuntive, problemi, dipendenze]*

### Funzionalità 2
**Stato**: [In Sviluppo/Testing/Review/Completata]  
**Priorità**: [Alta/Media/Bassa]  
**Sprint/Iterazione**: [Numero o nome]

**Descrizione**: *[Breve descrizione della funzionalità]*

**Progresso**: 
- [ ] Task 1
- [ ] Task 2
- [x] Task 3 (completato)

**Note**: *[Note aggiuntive, problemi, dipendenze]*

---

## PROSSIMI TASK
*[Da aggiornare manualmente - Elencare i prossimi task da completare]*

### Task Immediati (Prossimi 1-3 giorni)
- [ ] **Task 1**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

- [ ] **Task 2**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

### Task a Breve Termine (Prossima settimana)
- [ ] **Task 3**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

- [ ] **Task 4**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

### Task a Medio Termine (Prossime 2-4 settimane)
- [ ] **Task 5**: *[Descrizione breve]*
  - **Priorità**: [Alta/Media/Bassa]
  - **Stima**: [X ore/giorni]
  - **Dipendenti da**: [Altri task o persone]

---

## BLOCCHI E PROBLEMI
*[Da aggiornare manualmente - Elencare i blocchi attuali]*

### Blocco 1
**Descrizione**: *[Descrizione del problema o blocco]*

**Impatto**: [Alto/Medio/Basso]

**Azioni Richieste**: 
- [ ] Azione 1
- [ ] Azione 2

**Responsabile**: [Nome o ruolo]

**Data Identificazione**: [YYYY-MM-DD]

### Blocco 2
**Descrizione**: *[Descrizione del problema o blocco]*

**Impatto**: [Alto/Medio/Basso]

**Azioni Richieste**: 
- [ ] Azione 1
- [ ] Azione 2

**Responsabile**: [Nome o ruolo]

**Data Identificazione**: [YYYY-MM-DD]

---

## RISORSE E DIPENDENZE
*[Da aggiornare manualmente - Elencare risorse e dipendenze]*

### Risorse Umane
- **Sviluppatore**: [Nome/Ruolo] - [Disponibilità]
- **Designer**: [Nome/Ruolo] - [Disponibilità]
- **Tester**: [Nome/Ruolo] - [Disponibilità]

### Risorse Tecniche
- **Ambiente di Sviluppo**: [Descrizione]
- **Ambiente di Test**: [Descrizione]
- **Ambiente di Produzione**: [Descrizione]

### Dipendenze Esterne
- **API**: [Nome servizio] - [Stato]
- **Librerie**: [Nome libreria] - [Versione]
- **Servizi**: [Nome servizio] - [Stato]

---

## METRICHE E KPI
*[Da aggiornare manualmente - Definire metriche di successo]*

### Metriche Tecniche
- **Performance**: [Valore target]
- **Uptime**: [Valore target]
- **Error Rate**: [Valore target]
- **Load Time**: [Valore target]

### Metriche Funzionali
- **Utenti Attivi**: [Valore target]
- **Funzionalità Utilizzate**: [Valore target]
- **Soddisfazione Utente**: [Valore target]

### Metriche HACCP
- **Compliance Rate**: [Valore target]
- **Temperature Monitoring**: [Valore target]
- **Audit Success**: [Valore target]

---

## NOTE E OSSERVAZIONI
*[Da aggiornare manualmente - Note aggiuntive]*

### Note Generali
*[Note generali sul progetto, osservazioni, lezioni apprese]*

### Note Tecniche
*[Note tecniche specifiche, architettura, decisioni tecniche]*

### Note HACCP
*[Note specifiche per compliance HACCP, normative, best practices]*

---

**Ultimo Aggiornamento**: [YYYY-MM-DD HH:MM]  
**Aggiornato da**: [Nome]  
**Prossima Revisione**: [YYYY-MM-DD]
Hai detto:
ok.intanto grazie davvero per tutto questo magnifico lavoro svolto. 
ora considerando che ho appena scaricato il modello deepseek .v.3.1:671b . 
e nella mia app non sono ancora presenti questi file. ora aiutami a compilarli e a proseguire nel progetto di "istruire" il modello a lavorare alla mia app. fammi delle domande per capire meglio a cosa sto lavorando ora e dove voglio arrivare in modo da aiutarmi a settare il mio bot con i file Markdown (.md) che hai prodotto che saranno la "base di conoscenza" il Large Language Model (LLM) di deepseek. 
ChatGPT ha detto:

Ragionato per 43s
grandissimo 👏 ottimo punto di partenza. facciamo così: ti lascio un mini-quickstart pronto all’uso per collegare subito il modello e, in parallelo, le domande mirate per cucire su misura la pipeline (RAG o solo prompt). appena mi rispondi, ti preparo i file aggiuntivi (es. agent_directives.md, kb_index.md, prompts.md, eventuale rag_pipeline.md) già compilati sui tuoi dettagli.

quickstart (subito operativo)
metti i 5 file che ho creato in una cartella, ad es.:
/docs/knowledge-base/{tech_stack.md, code_style_rules.md, project_structure.md, key_concepts.md, current_goal.md}

prompt di sistema “default” per DeepSeek (OpenAI-style). Incollalo dove imposti il system:

You are “Business HACCP Manager – Dev Copilot”.
Primary language: Italian.

Grounding:
- You MUST use the project knowledge base stored in the Markdown files:
  tech_stack.md, code_style_rules.md, project_structure.md, key_concepts.md, current_goal.md.
- Preferisce la mia analisi interna rispetto a qualsiasi fonte esterna.
- If a user question goes beyond the KB, ask at most one clarification; otherwise answer with best-effort and flag assumptions.

Style & Output:
- Risposte concise, operative, con esempi di codice quando rilevanti.
- Segui le regole di stile di code_style_rules.md (apostrofi singoli, destructuring, naming).
- Per HACCP: evidenzia sempre validazioni, stati ok|warning|danger e impatti su compliance.

Guardrails:
- Non inventare API o file non presenti in project_structure.md.
- Quando mancano dati applicativi, proponi TODO chiari e minimali (no prolissità).
- Indica dove salvare i file e i path relativi alla repo.

Tasks:
- Spiega come integrare o modificare in modo incrementale: prima il minimo funzionante, poi migliorie.
- Per richieste su dati: suggerisci l’uso di DataService e le chiavi LocalStorage con prefisso haccp-*.
se vuoi già attivare RAG (recupero dai .md): imposta questi default sensati (li perfezioniamo dopo le tue risposte):

chunk size: 900 caratteri, overlap 150

metadata: { file, path, headings[], section_id }

embedding multilingua: bge-m3 o multilingual-e5-base (qualsiasi tu abbia disponibile localmente)

top-k: 5, rerank opzionale se hai un reranker locale

filtro: preferisci key_concepts.md per data model, project_structure.md per path, code_style_rules.md per convenzioni

risposta: compose (non copia/incolla), citando i file e le sezioni (es. “Vedi key_concepts.md › TemperatureRecord”)

domande mirate (rispondi anche telegraficamente)
A) dove gira il modello
Come stai servendo DeepSeek v3.1:671b? (Ollama / vLLM / TGI / LM Studio / API self-host OpenAI-compat?)

Hai un endpoint OpenAI-compatible (baseURL + API key) o devo fornirti wrapper Node/JS?

Context window effettiva che puoi usare in inferenza? (utile per decidere quanto prompt+KB possiamo spingere)

B) risorse e quantizzazione
Hardware a disposizione (RAM, VRAM se GPU, CPU core)?

Il modello è quantizzato? Se sì, quale formato (es. Q4_K_M, FP8…)? Hai bisogno di un piano “lite” (modello più piccolo) per il dev?

C) strategia knowledge (prompt vs RAG)
Vuoi partire senza RAG (solo system+few-shot) e aggiungerlo dopo, o entriamo subito con RAG locale su .md?

I .md resteranno stabili o cambieranno spesso? (se cambiano, servono script di re-indicizzazione veloce)

D) embedding & store
Hai già un modello di embedding locale? Quale? (se no, posso proporti 2 opzioni multi-lingua)

Dove preferisci lo storage vettoriale: file locale (HNSW/FAISS), SQLite+pgvector, oppure in-memory per iniziare?

E) integrazione app
Vuoi il bot inside SPA (iframe/pannello React) o come servizio esterno (Node server) con endpoint /chat?

Il bot deve leggere/scrivere dati dell’app (LocalStorage via DataService) o solo rispondere su documentazione?

F) stile, lingua, UX
Output in italiano fisso o multilingua?

Preferisci risposte brevi + snippet o passo-passo quando si tratta di refactor/migrazioni?

Vuoi citazioni delle fonti KB (nome file + sezione) in fondo alla risposta?

G) sicurezza & audit
Il bot può esporre path interni della repo e nomi chiave LocalStorage nell’output, o li mascheriamo?

Serve un limitatore (max token/risposta, rate limit) o va bene “best effort”?

H) qualità & test
Vuoi che prepari prompt di verifica (eval) per: data model, convenzioni stile, PWA, DataService?

Vuoi few-shot di esempio per: “aggiungi un campo al Product”, “nuova chiave LocalStorage”, “scrivi PDFExport per X”?

cosa posso darti subito dopo le tue risposte
agent_directives.md → persona, guardrail, tone, check-list di risposta (aderente ai tuoi vincoli)

kb_index.md → indice navigabile della KB con ancore/slug delle sezioni

prompts.md → system + developer + template user + few-shot su casi ricorrenti (HACCP/React/DataService)

(opzionale RAG) rag_pipeline.md → scelte embedding, chunking, k, schema metadati, flow query→retrieve→answer

(opzionale server) server_setup.md con snippet Node (OpenAI-compatible client) e script di ingestion .md

se vuoi, posso anche generare subito una prima versione di agent_directives.md e kb_index.md con i default di cui sopra: dimmi solo se parti con RAG o no e come stai esponendo l’endpoint del modello.

Hai detto:
Entità & Schemi

Gli schemi sono rappresentativi; la validazione completa avviene in DataService + utils/haccpRules.js.

Utente (User)
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt         // ISO
 * @property {boolean} isActive
 * @property {string=} companyId        // per multi-tenant in cloud
 */

Reparto (Department)
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt         // ISO
 * @property {string} createdBy         // userId
 */

Punto di Conservazione (ConservationPoint)
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name              // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */

Registrazione Temperatura (TemperatureRecord)
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id         // timestamp o uuid
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // nome umano ("Frigo A")
 * @property {string} location          // es. "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator          // nome operatore
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */


Esempio valido

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}

Task Pulizia (CleaningTask)
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee          // id utente o reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa' (prossima scadenza/assegnazione)
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */

Prodotto Inventario (Product)
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate        // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId
 * @property {string} createdAt         // ISO
 */


Esempio (estratto dal form)

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}

Fornitore (Supplier)
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */

Etichetta Prodotto (ProductLabel)
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode             // (opzionale) dati per QR
 * @property {string} createdAt
 * @property {string} expiresAt          // se applicabile
 * @property {boolean} archived
 */

Notifica (Notification)
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId             // id entità correlata
 * @property {string} createdAt
 * @property {boolean} read
 */

Regole HACCP (estratto operativo)

Range Temperature per categoria/punto (in utils/temperatureDatabase.js)

esempio categorie:

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules

Compatibilità: prevenzione mescolanza categorie incompatibili nello stesso punto

Status (ok|warning|danger): derivato dal confronto value vs range + tolleranza

Schedulazione Pulizie: frequency determina prossimi task; mancate esecuzioni → warning

Onboarding & Validazioni

Wizard step-by-step (in components/onboarding-steps/):

BusinessInfo → dati aziendali (possibile geocoding OSM/Nominatim se disponibile)

Departments → definizione/attivazione reparti (alcuni predefiniti e non eliminabili)

Conservation → punti di conservazione (tipo, soglie, categorie)

Staff → membri e ruoli

Tasks → mansioni iniziali (pulizie/operatività)

Inventory → seed inventario

Gating: avanzamento condizionato da useHaccpValidation + haccpRules; stato “confermato/non confermato” per sezione.

Flusso di Persistenza

UI (componenti feature) → invocano DataService per read/write.

DataService:

valida input

migra/mergia dati se necessario

aggiorna LocalStorage

registra action in haccp-actions

Sync (Simulato):

SyncManager opzionalmente chiama supabaseService (placeholder)

gating su companyId, gestione esiti/errore

Backup/Export:

BackupPanel produce haccp-backup-YYYY-MM-DD.json

Import con validazione schema minima

Notifiche & De-dup

NotificationSystem genera alert su:

temperature fuori range

scadenze imminenti (inventario/etichette)

pulizie non eseguite

De-dup: chiave di unicità (type + dataId)

Access Control

Hook useCan valuta capacità in base a:

ruolo (admin, responsabile, dipendente, collaboratore)

reparto e ownership dati

Azioni critiche (delete, export, sync) richiedono permessi elevati.

PWA Considerazioni

Cache offline gestita da sw.js

Prompt installazione personalizzato (componente dedicato)

In dev: main.jsx deregistra SW preesistenti per evitare cache incoerente



questa parte come la salvo? cosa ne devo fare?
ChatGPT ha detto:

Ragionato per 33s
perfetto 😎 quella è proprio la sezione “Entità & Schemi” di key_concepts.md.
Di seguito ti passo il file già pronto da salvare e poi come usarlo subito col modello.

<!-- docs/knowledge-base/key_concepts.md -->
# Key Concepts & Data Model — Business HACCP Manager
_Last update: 2025-09-08 • Source of truth for entities, persistence keys, compliance logic._

## Indice
- [Chiavi di Persistenza (LocalStorage)](#chiavi-di-persistenza-localstorage)
- [Entità & Schemi](#entità--schemi)
  - [User](#user)
  - [Department](#department)
  - [ConservationPoint](#conservationpoint)
  - [TemperatureRecord](#temperaturerecord)
  - [CleaningTask](#cleaningtask)
  - [Product](#product)
  - [Supplier](#supplier)
  - [ProductLabel](#productlabel)
  - [Notification](#notification)
- [Regole HACCP (operativo)](#regole-haccp-operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA Considerazioni](#pwa-considerazioni)

---

## Chiavi di Persistenza (LocalStorage)
> Prefisso **`haccp-*`** — gestite **solo** tramite `DataService` (`src/services/dataService.js`).

```js
{
  'haccp-app-data': {...},
  'haccp-users': [...],
  'haccp-current-user': {...},

  'haccp-business-info': {...},
  'haccp-business-data': {...},

  'haccp-departments': [...],
  'haccp-departments-v2': [...],

  'haccp-refrigerators': [...],
  'haccp-refrigerators-v2': [...],

  'haccp-temperatures': [...],

  'haccp-staff': [...],

  'haccp-cleaning': [...],
  'haccp-cleaning-departments': [...],

  'haccp-inventory': [...],
  'haccp-orders': [...],
  'haccp-inventory-products': [...],

  'haccp-suppliers': [...],

  'haccp-actions': [...],         // audit trail
  'haccp-notifications': [...],   // de-dup su (type + dataId)

  'haccp-product-labels': [...],
  'haccp-label-groups': [...],

  'haccp-onboarding': {...},

  'haccp-presets': {...}
}
Entità & Schemi
Gli schemi sono rappresentativi; la validazione completa vive in DataService + utils/haccpRules.js.

User
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // per multi-tenant in cloud
 */
Department
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt   // ISO
 * @property {string} createdBy   // userId
 */
ConservationPoint
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name              // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
TemperatureRecord
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id         // timestamp o uuid
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // nome umano ("Frigo A")
 * @property {string} location          // es. "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator          // nome operatore
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
CleaningTask
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee          // id utente o reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
Product
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate        // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId
 * @property {string} createdAt         // ISO
 */
Esempio

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
Supplier
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
ProductLabel
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode             // (opzionale) dati per QR
 * @property {string} createdAt
 * @property {string} expiresAt          // se applicabile
 * @property {boolean} archived
 */
Notification
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId             // id entità correlata
 * @property {string} createdAt
 * @property {boolean} read
 */
Regole HACCP (operativo)
Range Temperature (in utils/temperatureDatabase.js)

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules.

Compatibilità: previene mescolanza categorie incompatibili nello stesso punto.

Status (ok|warning|danger): derivato da value vs range + tolleranza.

Pulizie: frequency → prossimi task; ritardi ⇒ warning.

Onboarding & Validazioni
Wizard step-by-step (components/onboarding-steps/):

BusinessInfo

Departments

Conservation

Staff

Tasks

Inventory

Gating: useHaccpValidation + haccpRules; stato “confermato/non confermato”.

Flusso di Persistenza
UI → DataService (read/write)

DataService → valida, migra/merge, salva, logga in haccp-actions

Sync (simulato) → SyncManager → supabaseService (placeholder; gating companyId)

Backup/Export → BackupPanel crea haccp-backup-YYYY-MM-DD.json (import con validazione minima)

Notifiche & De-dup
Alert per temperature fuori range, scadenze, pulizie non eseguite.

De-dup su chiave (type + dataId).

Access Control
Hook useCan: ruolo (admin, responsabile, dipendente, collaboratore), reparto e ownership.

Azioni critiche (delete/export/sync) → permessi elevati.

PWA Considerazioni
Cache offline in public/sw.js.

Prompt installazione personalizzato.

In dev main.jsx deregistra SW preesistenti per evitare cache incoerenti.


---

## cosa farne (subito)

1) **Salvalo qui**  
`/docs/knowledge-base/key_concepts.md` (crea la cartella se non c’è).

2) **Aggiungilo alla tua KB**  
Se usi i 5 file che ti ho dato, assicurati che questo sia incluso nell’elenco che il bot considera come “fonte”.

3) **Senza RAG (subito operativo)**  
Nel **prompt di sistema** del tuo bot aggiungi:
La tua base di conoscenza è nella cartella /docs/knowledge-base.
Per modelli e validazioni, fai riferimento a key_concepts.md (sezione Entità & Schemi).

Quando fai domande di coding, chiedi al bot di citare “key_concepts.md › <sezione>”.

4) **Con RAG (consigliato appena pronto)**  
Indicizza `docs/knowledge-base/*.md` (chunk ~900 char, overlap 150).  
Filtri: preferisci `key_concepts.md` per data model; `project_structure.md` per path.  
Top-k=5, rerank opzionale.

5) **(Opzionale) Loader “light” in Node** – OpenAI-compatible
```js
// pseudo: carica MD e passalo come context add-on quando serve il data model
import fs from 'node:fs/promises';

const KC_PATH = './docs/knowledge-base/key_concepts.md';
export async function getKCSection(name){  // es. 'TemperatureRecord'
  const md = await fs.readFile(KC_PATH, 'utf8');
  const start = md.indexOf(`### ${name}`);
  if (start < 0) return '';
  const tail = md.slice(start);
  const end = tail.indexOf('\n### ');
  return end > 0 ? tail.slice(0, end) : tail;
}

// durante la chat:
// const extra = await getKCSection('TemperatureRecord');
// messages.push({ role:'system', content:`Riferimento KB:\n${extra}` });
se vuoi, al prossimo messaggio posso anche fornirti:

agent_directives.md (persona/guardrail pronti),

kb_index.md (indice della KB),

uno script di ingestion per RAG (con embeddings locali).

Hai detto:
Entità & Schemi, perche da qui in poi non mi fornisci un unico file? come devo trattare ogni file che mi mandi inclusi gli esempi? non sono un programmatore ho bisogno che mi dai istruzioni chiare su come procedere con i file e i dati che mi mandi
ChatGPT ha detto:

Ragionato per 35s
<!-- docs/knowledge-base/KB_SINGLE_FILE.md -->
# Business HACCP Manager — Knowledge Base (KB) in un unico file
**Versione:** 1.0 • **Ultimo aggiornamento:** 2025-09-08

Questo documento è la **base di conoscenza unica** per istruire il tuo modello (DeepSeek v3.1:671b) a lavorare sulla tua app.  
Contiene: istruzioni operative *non tecniche*, **Entità & Schemi**, regole HACCP, flussi e riferimenti rapidi.

---

## COME USARE QUESTO FILE (scegli UNA opzione)

### Opzione A — Senza RAG (subito operativa)
1. Crea la cartella: `docs/knowledge-base/`
2. Salva questo file come: **`docs/knowledge-base/KB_SINGLE_FILE.md`**
3. Nella tua interfaccia del modello (DeepSeek o UI compatibile), **incolla il seguente “Prompt di Sistema”**:

Sei “Business HACCP Manager – Dev Copilot” (lingua principale: Italiano).
Usa come base di verità il file: /docs/knowledge-base/KB_SINGLE_FILE.md.
Regole:

Segui convenzioni di codice: apostrofi singoli, destructuring di props, naming camelCase/PascalCase.

Non inventare file o API non presenti nella KB; proponi TODO minimi quando mancano dettagli.

Per HACCP, esplicita sempre validazioni e stati ok|warning|danger.

Quando rispondi, indica tra parentesi quadre la sezione della KB (es: [§ Entità › TemperatureRecord]).
Stile: risposte sintetiche e operative, con snippet quando utili.


4. Quando fai una domanda al bot, aggiungi in fondo:  
*“Se serve, cita la sezione rilevante della KB con il formato [§ …].”*

> **Consiglio:** se la tua UI consente **upload allegati** o **context files**, allega direttamente questo file: il modello potrà “vederlo” senza fare copia/incolla ogni volta.

---

### Opzione B — Con RAG (quando sei pronto)
Se usi o userai una pipeline RAG (retrieval di frammenti dal file):
- **Sorgente:** indicizza `docs/knowledge-base/KB_SINGLE_FILE.md`
- **Chunking suggerito:** 900 caratteri, overlap 150
- **Top-k:** 5 (con reranking se disponibile)
- **Metadati:** `{ file: "KB_SINGLE_FILE.md", headings: [h1..h3], section_id }`
- **Regole risposta:** comporre una risposta **sintetica** citando le sezioni (es. `[§ Entità › Product]`, `[§ Flusso di Persistenza]`)

> Se non sai cos’è il RAG, **ignora** questa sezione e usa l’**Opzione A**.

---

## COME AGGIORNARE O AGGIUNGERE ESEMPI
- **Dove scrivere:** all’interno di questo stesso file (mantieni la struttura).
- **Come aggiungere esempi:** crea sottosezioni con titolo “Esempio: …” e incolla gli snippet tra tripli backtick.
- **Cosa NON fare:** non cancellare le sezioni esistenti; aggiungi piuttosto “Note” o “Appendice”.
- **Quando aggiornare la data:** modifica “Ultimo aggiornamento” in alto ogni volta che cambi qualcosa.

---

## INDICE (clicca per navigare)
- [Chiavi di Persistenza (LocalStorage)](#chiavi-di-persistenza-localstorage)
- [Entità & Schemi](#entità--schemi)
- [User](#user)
- [Department](#department)
- [ConservationPoint](#conservationpoint)
- [TemperatureRecord](#temperaturerecord)
- [CleaningTask](#cleaningtask)
- [Product](#product)
- [Supplier](#supplier)
- [ProductLabel](#productlabel)
- [Notification](#notification)
- [Regole HACCP — Estratto Operativo](#regole-haccp--estratto-operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA — Considerazioni](#pwa--considerazioni)
- [Esempi pronti all’uso (copiabili nel prompt)](#esempi-pronti-alluso-copiabili-nel-prompt)
- [Glossario veloce](#glossario-veloce)

---

## Chiavi di Persistenza (LocalStorage)
> Prefisso **`haccp-*`**. Gestisci **solo** tramite `DataService` (non scrivere mai direttamente da componenti).

```js
{
'haccp-app-data': {...},
'haccp-users': [...],
'haccp-current-user': {...},

'haccp-business-info': {...},
'haccp-business-data': {...},

'haccp-departments': [...],
'haccp-departments-v2': [...],

'haccp-refrigerators': [...],
'haccp-refrigerators-v2': [...],

'haccp-temperatures': [...],

'haccp-staff': [...],

'haccp-cleaning': [...],
'haccp-cleaning-departments': [...],

'haccp-inventory': [...],
'haccp-orders': [...],
'haccp-inventory-products': [...],

'haccp-suppliers': [...],

'haccp-actions': [...],         // audit trail
'haccp-notifications': [...],   // de-dup su (type + dataId)

'haccp-product-labels': [...],
'haccp-label-groups': [...],

'haccp-onboarding': {...},

'haccp-presets': {...}
}
Entità & Schemi
Gli schemi sono rappresentativi; la validazione completa è in DataService + utils/haccpRules.js.

User
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // per multi-tenant in cloud
 */
[§ Entità › User]

Department
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt   // ISO
 * @property {string} createdBy   // userId
 */
[§ Entità › Department]

ConservationPoint
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name              // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
[§ Entità › ConservationPoint]

TemperatureRecord
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id         // timestamp o uuid
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // nome umano ("Frigo A")
 * @property {string} location          // es. "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator          // nome operatore
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio valido

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
[§ Entità › TemperatureRecord]

CleaningTask
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee          // id utente o reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa' (prossima scadenza/assegnazione)
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
[§ Entità › CleaningTask]

Product
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate        // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId
 * @property {string} createdAt         // ISO
 */
Esempio (estratto dal form)

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
[§ Entità › Product]

Supplier
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
[§ Entità › Supplier]

ProductLabel
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode             // (opzionale) dati per QR
 * @property {string} createdAt
 * @property {string} expiresAt          // se applicabile
 * @property {boolean} archived
 */
[§ Entità › ProductLabel]

Notification
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId             // id entità correlata
 * @property {string} createdAt
 * @property {boolean} read
 */
[§ Entità › Notification]

Regole HACCP — Estratto Operativo
Range Temperature (vedi utils/temperatureDatabase.js):

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules.

Compatibilità: evitare mescolanza categorie incompatibili nello stesso punto di conservazione.

Status (ok|warning|danger): calcolato confrontando value con range + tolleranza.

Pulizie: frequency → prossimi task; mancata esecuzione ⇒ warning.
[§ Regole HACCP]

Onboarding & Validazioni
Wizard (components/onboarding-steps/):

BusinessInfo → Dati aziendali (eventuale geocoding OSM/Nominatim)

Departments → Reparti (alcuni predefiniti non eliminabili)

Conservation → Punti di conservazione (tipo/soglie/categorie)

Staff → Personale e ruoli

Tasks → Mansioni iniziali (pulizie/operatività)

Inventory → Seed inventario

Gating: useHaccpValidation + haccpRules; stato per sezione: “confermato/non confermato”.
[§ Onboarding & Validazioni]

Flusso di Persistenza
UI (componenti feature) → DataService (read/write).

DataService → valida, migra/merge, salva su LocalStorage, registra in haccp-actions.

Sync (simulato) → SyncManager chiama supabaseService (placeholder; gating su companyId).

Backup/Export → BackupPanel crea haccp-backup-YYYY-MM-DD.json (import con validazione minima).
[§ Flusso di Persistenza]

Notifiche & De-dup
Generazione alert per:

temperature fuori range,

scadenze imminenti (inventario/etichette),

pulizie non eseguite.

De-dup: chiave di unicità (type + dataId).
[§ Notifiche & De-dup]

Access Control
Hook useCan valuta capacità in base a: ruolo (admin, responsabile, dipendente, collaboratore), reparto, ownership.

Azioni critiche (delete/export/sync) richiedono permessi elevati.
[§ Access Control]

PWA — Considerazioni
Cache offline gestita da public/sw.js.

Prompt di installazione personalizzato.

In dev: main.jsx deregistra service worker preesistenti per evitare cache incoerente.
[§ PWA]

Esempi pronti all’uso (copiabili nel prompt)
Esempio 1 — Crea un nuovo TemperatureRecord valido

“Genera un oggetto TemperatureRecord per Frigo A a 3.8°C oggi alle 10:30, operatore Mario Rossi, status coerente con le regole.”
Atteso:

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 3.8,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
Riferimento: [§ Entità › TemperatureRecord], [§ Regole HACCP]

Esempio 2 — Valida un Product

“Verifica che questo Product sia conforme e proponi correzioni minime se servono:”

{
  name: 'Salmone Fresco',
  category: 'Pesce',
  department: 'Cucina',
  conservationPoint: 'Frigo Pesce',
  expiryDate: '2025-09-10',
  allergens: ['pesce'],
  lotNumber: 'L2025-09-010',
  batchDeliveryDate: '2025-09-08',
  supplierName: 'Ittica Mare Srl',
  associatedOrderId: 'ORD-456'
}
Riferimento: [§ Entità › Product], [§ Regole HACCP]

Esempio 3 — Crea task di pulizia settimanale

“Crea un CleaningTask settimanale per ‘Sanificare piani lavoro’ assegnato al reparto Cucina.”

{
  id: 'task-001',
  task: 'Sanificare piani lavoro',
  assignee: 'Cucina',                // reparto
  frequency: 'settimanale',
  date: '08/09/2025',
  completed: false,
  completedAt: null,
  completedBy: null,
  priority: 'Alta',
  notes: ''
}
Riferimento: [§ Entità › CleaningTask]

Esempio 4 — Suggerisci status temperatura

“Dato value = -16 e type = 'freezer', calcola lo status con tolleranza ±2°C.”
Riferimento: [§ Regole HACCP]

Esempio 5 — Prepara checklist onboarding

“Elenca i controlli minimi per completare lo step ‘Conservation’ nell’onboarding.”
Riferimento: [§ Onboarding & Validazioni]

Glossario veloce
RAG: Recupero di parti della KB per rispondere alle domande (opzionale).

Status ok|warning|danger: qualità/criticità del dato in relazione alle regole HACCP.

DataService: unico punto di accesso a LocalStorage con validazioni e migrazioni.

De-dup notifiche: evitare duplicati con chiave (type + dataId).

Fine del documento.

Hai detto:
Entità & Schemi

Gli schemi sono rappresentativi; la validazione completa è in DataService + utils/haccpRules.js.

User: 
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // per multi-tenant in cloud
 */


tu mi dai queste istruzioni ma io non so cosa fare con user. spiegami come usare queste informazioni che mi stai dando. 
faccio dei singoli file ognuno nominato User + il codice poi faccio un altro file Department + il codice  e proseguo così? non so come utilizzare questi file che mi stai dando
ChatGPT ha detto:

Ragionato per 50s
tranquillo: non devi creare un file separato per ogni entità (User, Department, …).
Quelli che ti ho dato sono schemi di riferimento per il modello e per te: servono a dire al bot “quando parliamo di un User, i campi sono questi”. La via più semplice è tenere tutto in un unico file KB e usarlo per istruire DeepSeek.

Ti lascio un unico file guida con istruzioni passo-passo (non tecniche) e con esempi pronti che puoi copiare/incollare nelle chat col modello.

<!-- docs/knowledge-base/KB_USAGE_GUIDE.md -->
# Come usare la Knowledge Base (senza essere programmatore)

Questo documento ti spiega **cosa fare** con gli schemi (User, Department, ecc.) e **come usarli col modello**.

## Cosa NON fare
- ❌ Non creare un file per ogni entità (niente `User.md`, `Department.md`, ecc.).
- ❌ Non cercare di “eseguire” gli schemi: sono **descrizioni**, non codice da lanciare.

## Cosa fare (semplice e funzionante)
1. Crea la cartella `docs/knowledge-base/` nella tua repo.
2. Salva qui:
   - `KB_SINGLE_FILE.md` (la tua base di conoscenza unica).
   - `KB_USAGE_GUIDE.md` (questo file).
3. Nel tuo tool di DeepSeek imposta questo **Prompt di Sistema**:

Sei “Business HACCP Manager – Dev Copilot” (Italiano).
Usa come base di verità: /docs/knowledge-base/KB_SINGLE_FILE.md.
Quando l’utente chiede di creare/validare dati, usa gli schemi della sezione “Entità & Schemi”.
Rispondi in modo sintetico e operativo, con JSON quando richiesto.
Cita la sezione della KB tra parentesi quadre (es: [§ Entità › User]).


> Da qui in poi, quando vorrai creare/modificare dati, **parla col modello** usando gli esempi sotto. Il modello genererà JSON corretti in base agli schemi.

---

## Come “usare” lo schema `User` (passo-passo)

### 1) Far generare un nuovo utente al modello
**Copia/incolla nel messaggio al modello:**
> Crea un oggetto **User** per un nuovo dipendente.  
> Nome: Anna Verdi, PIN: 2468, ruolo: dipendente, reparto: Cucina.  
> Genera i campi mancanti (id, createdAt, isActive=true).  
> Output **solo JSON** conforme allo schema di [§ Entità › User].

**Cosa ricevi:** un JSON pronto, es.:
```json
{
"id": "usr_1736425012345",
"name": "Anna Verdi",
"pin": "2468",
"role": "dipendente",
"department": "Cucina",
"createdAt": "2025-09-08T10:15:00.000Z",
"isActive": true,
"companyId": "default"
}
2) Far validare/correggere un utente esistente
Verifica che questo User sia conforme allo schema di [§ Entità › User] e correggi solo il minimo indispensabile.
Output: JSON corretto + elenco correzioni.

{ "id":"u1", "name":"Luca", "pin":"12", "role":"admin", "department":"" }
3) Far trasformare in blocco molti utenti
Ho una lista di utenti in formati diversi. Uniformali allo schema di [§ Entità › User], genera i campi mancanti (id, createdAt, isActive), normalizza i ruoli (admin/responsabile/dipendente/collaboratore). Output: array JSON.

Come far “entrare” i dati nell’app (senza programmare)
Opzione A — Usare l’interfaccia dell’app (se presente)
Se la tua app ha una schermata “Staff/Utenti”, inserisci i dati lì manualmente usando i JSON come riferimento: i campi e i valori vengono dal modello.

Opzione B — Import tramite BackupPanel
Apri l’app e vai a Backup/Export → clicca Esporta per ottenere un file (es. haccp-backup-2025-09-08.json).

Apri il file esportato con un editor di testo.

Cerca la chiave "haccp-users": [ ... ].

Aggiungi dentro l’array gli oggetti User generati dal modello (mantieni le virgole e la sintassi JSON).

Salva e torna nell’app → Importa dal pannello Backup → seleziona il file modificato.

Verifica in app che i nuovi utenti compaiano.

Suggerimento: fai prima una copia di sicurezza del file esportato originale.

Prompt “pronti” per le altre entità
Department
Crea un Department chiamato “Cucina”, abilitato, con descrizione e location essenziali.
Genera id, createdAt, createdBy="system", isCustom=true.
Output solo JSON conforme a [§ Entità › Department].

ConservationPoint
Crea un ConservationPoint per “Frigo A” in “Cucina”, type “frigo”, targetTemp=4.
Seleziona categorie compatibili e compila compliance con isValid=true, warnings vuoti.
Output solo JSON conforme a [§ Entità › ConservationPoint].

TemperatureRecord
Genera un TemperatureRecord per “Frigo A” oggi alle 10:30 con value=3.8, unit="°C", type="frigo", operatore “Mario Rossi”.
Calcola lo status secondo [§ Regole HACCP]. Output JSON.

CleaningTask
Crea un CleaningTask settimanale “Sanificare piani lavoro” assegnato al reparto “Cucina”, priorità “Alta”.
Compila date con la prossima scadenza (gg/mm/aaaa). Output JSON conforme a [§ Entità › CleaningTask].

Product
Uniforma questo Product allo schema di [§ Entità › Product] e riempi i campi mancanti (lotNumber, createdAt).
Controlla coerenza expiryDate e batchDeliveryDate. Output JSON corretto.

Supplier
Genera un Supplier per “Caseificio X” con vat, phone, email, notes sintetiche.
Output JSON conforme a [§ Entità › Supplier].

ProductLabel
Crea una ProductLabel per il productId “prod-123”, con labelGroupId="fridge-auto", QR facoltativo, expiresAt tra 7 giorni. Output JSON.

Notification
Genera una Notification di tipo “expiry” per il dataId="prod-123", con titolo e messaggio brevi.
read=false, createdAt ISO. Output JSON conforme a [§ Entità › Notification].

Cosa chiedere al modello quando hai dubbi
“Questi due JSON rispettano la KB? Se no, correggi al minimo.”

“Mostrami le differenze tra il mio oggetto e lo schema di [§ Entità › …].”

“Suggerisci status per queste temperature seguendo [§ Regole HACCP].”

“Preparami un file di backup con solo la sezione haccp-users pronto per l’import.”

Note importanti
Gli schemi non sono codice eseguibile: sono forme che il modello deve rispettare quando crea dati.

Il salvataggio reale nell’app avviene o via UI, o via Import/Backup, o (più tecnico) tramite DataService dal codice.

Se in futuro vorrai l’inserimento automatico, prepareremo un piccolo script che prende i JSON dal modello e li inserisce (opzione tecnica).

Fine.


---

se vuoi, nel prossimo messaggio dimmi se nella tua app **vedi il pannello Backup/Export**. Se sì, ti preparo **un esempio di file di backup** già pronto in cui devi solo incollare gli utenti che il modello genera (lo salvi e lo importi). Se no, andiamo con l’inserimento via interfaccia dell’app o ti preparo un mini-script “inserisci utenti” super semplice.
Hai detto:
quindi ora organizzami i file in questo modo : 
_ titolo file 
 . Contenuto 

_istruzioni su come utilizzarlo e dove salvarmelo e perchè.

_titolo file 
 . Contenuto 

__istruzioni su come utilizzarlo e dove salvarmelo e perchè. 


fai così per ogni file importante che devo salvarmi e utilizzare per il chat bot. 

vorrei che alla fine mi hai organizzato tutti i file con le sue istruzioni, e delle istruzioni generali per : dove partire, come proseguire, cosa dovrei ottenere.
ChatGPT ha detto:

Ragionato per 1m 12s
Hai detto:
mi hai scritto "Entità & Schemi (estratto)" in che senso estratto? fammi la versione completa. 
ChatGPT ha detto:

Ragionato per 1m 18s
perfetto, mettiamo ordine una volta per tutte.
Qui sotto trovi tutti i file importanti per far lavorare il tuo chat bot (DeepSeek) sulla tua app.
Per ciascuno ti do:

Titolo file

. Contenuto (il file già pronto da salvare)

_Istruzioni (come usarlo, dove salvarlo e perché)

Alla fine trovi anche istruzioni generali: da dove partire, come proseguire e cosa dovresti ottenere.

Titolo file: docs/knowledge-base/KB_SINGLE_FILE.md
. Contenuto

# Business HACCP Manager — Knowledge Base (KB) in un unico file
**Versione:** 1.1 • **Ultimo aggiornamento:** 2025-09-08

Questo documento è la **base di conoscenza unica** per istruire il tuo modello (DeepSeek v3.1:671b) a lavorare sulla tua app.
Contiene: istruzioni operative, **Entità & Schemi (completi)**, regole HACCP, flussi e riferimenti rapidi.

---

## COME USARE QUESTO FILE

### Opzione A — Senza RAG (più semplice, subito operativa)
Imposta nel modello un **Prompt di Sistema** che dica: “usa come base di verità `/docs/knowledge-base/KB_SINGLE_FILE.md`”.
Quando fai domande, chiedi al modello di citare le sezioni con il formato `[§ …]`.

### Opzione B — Con RAG (facoltativa, per risposte più precise)
Indicizza questo file. Chunk 900 caratteri, overlap 150, top-k 5. Metadati: `{ file: "KB_SINGLE_FILE.md", headings[], section_id }`.

---

## INDICE
- [Chiavi di Persistenza (LocalStorage)](#chiavi-di-persistenza-localstorage)
- [Entità & Schemi (COMPLETI)](#entità--schemi-completi)
  - [User](#user)
  - [StaffMember](#staffmember)
  - [Department](#department)
  - [BusinessInfo](#businessinfo)
  - [ConservationPoint](#conservationpoint)
  - [TemperatureRecord](#temperaturerecord)
  - [CleaningTask](#cleaningtask)
  - [Supplier](#supplier)
  - [Order](#order)
  - [Product](#product)
  - [ProductLabel](#productlabel)
  - [LabelGroup](#labelgroup)
  - [Notification](#notification)
  - [ActionLog](#actionlog)
  - [OnboardingState](#onboardingstate)
- [Regole HACCP — Operativo](#regole-haccp--operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA — Considerazioni](#pwa--considerazioni)
- [Esempi pronti all’uso](#esempi-pronti-alluso)

---

## Chiavi di Persistenza (LocalStorage)
Prefisso **`haccp-*`** — usa **solo** `DataService` (mai scrivere direttamente dai componenti).
```js
{
  'haccp-app-data': {...},              // meta versione/migrazioni
  'haccp-users': [...],
  'haccp-current-user': {...},

  'haccp-business-info': {...},         // dati azienda
  'haccp-business-data': {...},         // extra/legacy

  'haccp-departments': [...],
  'haccp-departments-v2': [...],

  'haccp-refrigerators': [...],         // legacy
  'haccp-refrigerators-v2': [...],      // ConservationPoint

  'haccp-staff': [...],
  'haccp-suppliers': [...],
  'haccp-orders': [...],

  'haccp-inventory': [...],             // legacy
  'haccp-inventory-products': [...],    // Product attuale
  'haccp-product-labels': [...],
  'haccp-label-groups': [...],

  'haccp-temperatures': [...],
  'haccp-cleaning': [...],
  'haccp-cleaning-departments': [...],

  'haccp-notifications': [...],
  'haccp-actions': [...],               // audit trail

  'haccp-onboarding': {...},
  'haccp-presets': {...}
}
[§ Persistenza]

Entità & Schemi (COMPLETI)
Gli schemi descrivono cosa deve contenere ogni oggetto. La validazione completa vive in DataService + utils/haccpRules.js.

User
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // multi-tenant cloud
 */
[§ Entità › User]

StaffMember
/**
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} fullName
 * @property {string} role
 * @property {string[]} categories
 * @property {string} certification         // HACCP certificate id/desc
 * @property {string} notes
 * @property {string} addedDate             // 'YYYY-MM-DD'
 * @property {string} addedTime             // 'HH:mm'
 * @property {boolean} isRegisteredUser     // se esiste un User associato
 * @property {string=} userId               // link a User.id
 */
[§ Entità › StaffMember]

Department
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager              // userId o nome
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt            // ISO
 * @property {string} createdBy            // userId
 */
Vincoli: nome unico per companyId; alcuni predefiniti non eliminabili (es. Banconisti, Cuochi, Amministrazione).
[§ Entità › Department]

BusinessInfo
/**
 * @typedef {Object} BusinessInfo
 * @property {string} companyId
 * @property {string} businessName
 * @property {string} vatNumber
 * @property {string} address
 * @property {string} city
 * @property {string} cap
 * @property {string} countryCode
 * @property {{lat:number, lon:number}=} geo
 * @property {string} createdAt // ISO
 * @property {string} updatedAt // ISO
 */
[§ Entità › BusinessInfo]

ConservationPoint
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name                        // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories        // categorie ammesse
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
[§ Entità › ConservationPoint]

TemperatureRecord
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id                   // timestamp o uuid
 * @property {string} date                        // 'gg/mm/aaaa'
 * @property {number} timestamp                   // epoch ms
 * @property {string} refrigerator                // nome umano ("Frigo A")
 * @property {string} location                    // es. "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value                       // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator                    // nome operatore
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
[§ Entità › TemperatureRecord]

CleaningTask
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee                   // id utente o nome reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date                       // 'gg/mm/aaaa' prossima scadenza
 * @property {boolean} completed
 * @property {string|null} completedAt           // ISO o null
 * @property {string|null} completedBy           // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
[§ Entità › CleaningTask]

Supplier
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
[§ Entità › Supplier]

Order
/**
 * @typedef {Object} Order
 * @property {string} id                  // es. 'ORD-123'
 * @property {string} supplierName
 * @property {string} orderDate           // 'YYYY-MM-DD'
 * @property {string} notes
 * @property {string} createdAt           // ISO
 */
[§ Entità › Order]

Product
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate          // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate   // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId   // Order.id
 * @property {string} createdAt           // ISO
 */
Esempio

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
[§ Entità › Product]

ProductLabel
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode               // opzionale
 * @property {string} createdAt
 * @property {string} expiresAt            // se applicabile
 * @property {boolean} archived
 */
[§ Entità › ProductLabel]

LabelGroup
/**
 * @typedef {Object} LabelGroup
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} createdAt
 * @property {boolean} autoCleanup         // pulizia automatica etichette scadute
 */
[§ Entità › LabelGroup]

Notification
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId               // id entità correlata
 * @property {string} createdAt
 * @property {boolean} read
 */
[§ Entità › Notification]

ActionLog
/**
 * @typedef {Object} ActionLog
 * @property {string} id
 * @property {string} actorId              // userId
 * @property {string} action               // es. 'CREATE_PRODUCT'
 * @property {string} entity               // es. 'Product'
 * @property {string} entityId
 * @property {object} meta
 * @property {string} createdAt            // ISO
 */
[§ Entità › ActionLog]

OnboardingState
/**
 * @typedef {Object} OnboardingState
 * @property {{confirmed:boolean, data:any}} businessInfo
 * @property {{confirmed:boolean, data:any}} departments
 * @property {{confirmed:boolean, data:any}} conservation
 * @property {{confirmed:boolean, data:any}} staff
 * @property {{confirmed:boolean, data:any}} tasks
 * @property {{confirmed:boolean, data:any}} inventory
 * @property {string} updatedAt // ISO
 */
[§ Entità › OnboardingState]

Regole HACCP — Operativo
Range Temperature (vedi utils/temperatureDatabase.js)

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules.

Compatibilità: vieta mescolanza categorie incompatibili nello stesso punto.

Status (ok|warning|danger): calcolato da value vs range + tolleranza.

Pulizie: frequency → prossimi task; ritardi ⇒ warning.
[§ Regole HACCP]

Onboarding & Validazioni
Wizard (components/onboarding-steps/): BusinessInfo → Departments → Conservation → Staff → Tasks → Inventory.
Gating: useHaccpValidation + haccpRules; stato step “confermato/non confermato”.
[§ Onboarding]

Flusso di Persistenza
UI → DataService (read/write)

DataService → valida, migra/merge, salva, logga in haccp-actions

Sync (simulato) → SyncManager → supabaseService (gating companyId)

Backup/Export → BackupPanel produce haccp-backup-YYYY-MM-DD.json
[§ Persistenza]

Notifiche & De-dup
Alert per: temperature fuori range, scadenze, pulizie non eseguite.

De-dup per (type + dataId).
[§ Notifiche]

Access Control
Hook useCan: ruolo (admin|responsabile|dipendente|collaboratore), reparto, ownership.

Azioni critiche (delete/export/sync) → permessi elevati.
[§ Access Control]

PWA — Considerazioni
Cache offline in public/sw.js

Prompt install personalizzato

In dev: main.jsx deregistra SW preesistenti
[§ PWA]

Esempi pronti all’uso
“Genera TemperatureRecord per Frigo A con 3.8°C ora, status coerente.” → [§ TemperatureRecord], [§ Regole HACCP]

“Uniforma questi Product allo schema e riempi i campi mancanti.” → [§ Product]

“Crea CleaningTask settimanale per Cucina (Alta).” → [§ CleaningTask]


**_Istruzioni (come usarlo, dove salvarlo, perché)_**
- **Dove salvarlo:** `docs/knowledge-base/KB_SINGLE_FILE.md`
- **Perché:** è la **fonte unica** che il modello userà per capire dati, regole e flussi della tua app.
- **Come usarlo:** allegalo o rendilo accessibile al modello; nelle richieste chiedi di citare le sezioni `[§ …]`. Se in futuro userai RAG, indicizza solo questo file.

---

## _Titolo file_: `docs/agent/agent_directives.md`
**. Contenuto**
```markdown
# Agent Directives — Business HACCP Manager (DeepSeek)

## Persona
Sei “Business HACCP Manager – Dev Copilot”. Lingua principale: Italiano. Obiettivo: assistenza operativa su codice, dati e compliance HACCP dell’app.

## Grounding (base di verità)
- **Usa**: `/docs/knowledge-base/KB_SINGLE_FILE.md` (prioritario).
- Non inventare file/API non presenti nella KB o in `project_structure.md`.
- Se un’informazione manca, proponi **TODO minimi** e ipotesi marcate come tali.

## Stile Risposte
- Brevi, operative, con snippet quando servono.
- Segui convenzioni: apostrofi singoli, destructuring props, camelCase/PascalCase.
- Per HACCP evidenzia sempre validazioni e stati `ok|warning|danger`.

## Sicurezza & Guardrail
- Non esporre segreti (API key, .env).
- Evita comandi distruttivi se non richiesti esplicitamente.
- Per dati sensibili, suggerisci export/import via BackupPanel, non dump completo in chat.

## Checklist prima di rispondere
1. La domanda rientra nella KB? Se no, chiedi **una** chiarificazione o procedi best-effort segnalando le assunzioni.
2. Serve riferirsi a uno schema? Cita `[§ Entità › ...]`.
3. Ci sono effetti HACCP? Indica range, tolleranza, status.
4. Specifica dove salvare/modificare file e il path relativo.

## Output attesi
- JSON conforme agli schemi quando si parla di dati.
- Istruzioni puntuali con path e file quando si parla di codice.
- Riferimenti KB in fondo: es. _Rif: [§ Product], [§ Persistenza]_.
Istruzioni

Dove salvarlo: docs/agent/agent_directives.md

Perché: definisce come il bot deve comportarsi (tono, regole, checklist).

Come usarlo: incolla il contenuto (o un estratto) nel Prompt di Sistema del modello e/o allega il file come contesto persistente.

Titolo file: docs/agent/prompts.md
. Contenuto

# Prompt Templates — Business HACCP Manager

## SYSTEM (consigliato)
Sei “Business HACCP Manager – Dev Copilot”.
Usa come base di verità `/docs/knowledge-base/KB_SINGLE_FILE.md`.
Segui `docs/agent/agent_directives.md`.

## DEVELOPER (facoltativo ma utile)
- Rispondi in italiano, conciso.
- Per i dati, produci **solo JSON** conforme agli schemi.
- Cita le sezioni KB in fondo alla risposta.

## USER — Template rapidi

### 1) Crea utente
Crea un oggetto **User**:
- Nome: {{NOME}}, PIN: {{PIN}}, ruolo: {{RUOLO}}, reparto: {{REPARTO}}
- Genera id, createdAt, isActive=true.
Output: **solo JSON**.  
_Rif KB: [§ Entità › User]_

### 2) Nuovo punto conservazione
Crea **ConservationPoint** “{{NOME}}” in “{{LOCATION}}”, type “{{TIPO}}”, targetTemp={{TEMP}}.
Seleziona categorie compatibili e `compliance.isValid=true`.  
Output: **solo JSON**.  
_Rif KB: [§ Entità › ConservationPoint]_

### 3) Registrazione temperatura
Genera **TemperatureRecord** per “{{FRIGO}}” con value={{VALORE}} °C ora, operator “{{OPERATORE}}”.
Calcola `status` secondo le regole.  
Output: **solo JSON**.  
_Rif KB: [§ Entità › TemperatureRecord], [§ Regole HACCP]_

### 4) Task pulizia
Crea **CleaningTask** {{FREQUENZA}} “{{TASK}}” per reparto “{{REPARTO}}”, priorità “{{PRIORITA}}”.  
Output: **solo JSON**.  
_Rif KB: [§ Entità › CleaningTask]_

### 5) Normalizza prodotti
Uniforma questi **Product** allo schema e riempi i campi mancanti (lotNumber, createdAt).  
Output: **array JSON**.  
_Rif KB: [§ Entità › Product]_
Istruzioni

Dove salvarlo: docs/agent/prompts.md

Perché: ti dà copioni pronti da incollare nelle chat con il bot.

Come usarlo: apri il file, copia il template adatto, sostituisci le parentesi {{...}} e incolla nella chat del modello.

Titolo file: docs/agent/deepseek_setup.md
. Contenuto

# DeepSeek Setup — Collegare il modello alla tua KB

## Prerequisiti
- Endpoint del modello (OpenAI-compatible) + API Key, **oppure** UI che consente allegati di file.
- Node.js ≥ 18 (se usi il client da codice).

## Opzione 1 — Solo interfaccia (più semplice)
1) Salva `docs/knowledge-base/KB_SINGLE_FILE.md`.
2) Nel modello, imposta il **Prompt di Sistema**: vedi `docs/agent/prompts.md` → SYSTEM.
3) Se la UI supporta **allegati**, allega `KB_SINGLE_FILE.md` come contesto.

## Opzione 2 — Client Node (OpenAI-compatible)
Esempio minimale:
```js
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL // es. http://localhost:8000/v1
});

const system = `Usa /docs/knowledge-base/KB_SINGLE_FILE.md come base di verità.`;
const user = `Crea un TemperatureRecord per Frigo A a 3.8°C. Output JSON.`;

const res = await client.chat.completions.create({
  model: 'deepseek-v3.1-671b',
  messages: [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ]
});

console.log(res.choices[0].message);
Consiglio RAG (facoltativo)
Se poi attivi RAG, vedi docs/agent/rag_pipeline.md.


**_Istruzioni_**
- **Dove salvarlo:** `docs/agent/deepseek_setup.md`
- **Perché:** guida pratica per collegare il modello alla KB.
- **Come usarlo:** segui **Opzione 1** se non vuoi programmare; altrimenti usa lo snippet Node.

---

## _Titolo file_: `docs/agent/rag_pipeline.md`
**. Contenuto**
```markdown
# RAG Pipeline — Versione semplice

## Quando usarla
Se vuoi che il modello legga **solo** i pezzi rilevanti della KB per ogni domanda.

## Parametri consigliati
- Chunk size: **900** caratteri
- Overlap: **150**
- Top-k: **5**
- Metadati per chunk: `{ file, headings[], section_id }`

## Priorità documenti
1) `KB_SINGLE_FILE.md` (basta lui)
2) (Opzionale) altri .md se in futuro li separi

## Logica risposta
- Recupera i migliori chunk.
- Componi una risposta breve e operativa.
- **Cita** le sezioni (es. `[§ Entità › Product]`).

## Se vuoi uno script (facoltativo)
- Usa qualsiasi tool che indicizza markdown (anche no-code/GUI).
- Reindicizza quando modifichi la KB.
Istruzioni

Dove salvarlo: docs/agent/rag_pipeline.md

Perché: documenta come configurare (in futuro) il recupero della KB.

Come usarlo: se per ora non usi RAG, ignoralo; quando vorrai precisione maggiore, seguilo.

Titolo file: docs/knowledge-base/tech_stack.md
. Contenuto

# Tech Stack — Business HACCP Manager

- React 18.2.0, react-dom 18.2.0
- Vite 4.4.5 + @vitejs/plugin-react 4.0.3
- JavaScript (no TypeScript)
- Tailwind CSS 3.3.3, PostCSS 8.4.27, Autoprefixer 10.4.14
- Lucide React 0.263.1
- jsPDF 3.0.1 **via CDN** in `index.html`
- PWA: `public/manifest.json`, `public/sw.js` (+ deregister SW in `main.jsx`)
- Persistenza: LocalStorage (`haccp-*`) tramite `src/services/dataService.js`
- Cloud (placeholder): Supabase client in `src/lib/supabase.js`, wrapper in `src/services/supabaseService.js`
- Lint: ESLint 8.45.0 + plugin React/Hooks/Refresh
Istruzioni

Dove salvarlo: docs/knowledge-base/tech_stack.md

Perché: il bot può rispondere su versioni/dipendenze e scelte tecniche.

Come usarlo: allegalo o includilo nel contesto; oppure mantienilo per consulto umano.

Titolo file: docs/knowledge-base/code_style_rules.md
. Contenuto

# Regole di Stile e Convenzioni

- Componenti: **PascalCase** (1 file = 1 componente)
- Hook custom: prefisso `use` (es. `useCan`, `useHaccpData`)
- Variabili/funzioni: **camelCase**; costanti: **SCREAMING_SNAKE_CASE**
- Stringhe: **apostrofi singoli**; usa template literal per interpolazioni
- Props: **destructuring obbligatorio**
- Import order: librerie → componenti → servizi/utils → stili
- Error handling: try/catch per IO; fallback sicuri
- Validazioni: schema-level per dati critici; evita `dangerouslySetInnerHTML`
- UX: conferma per azioni distruttive; badge `ok|warning|danger` coerenti
Istruzioni

Dove salvarlo: docs/knowledge-base/code_style_rules.md

Perché: dà coerenza alle risposte e agli snippet del bot.

Come usarlo: il bot lo cita quando genera/valida codice.

Titolo file: docs/knowledge-base/project_structure.md
. Contenuto

# Struttura del Progetto (mappa)

Business-HACCP-manager/
├─ public/ (manifest.json, sw.js, icons/, assets/help/fridge/)
├─ src/
│  ├─ components/ (feature + UI)
│  │  ├─ ui/ (Button.jsx, Card.jsx, Input.jsx, Label.jsx, Tabs.jsx, TemperatureInput.jsx)
│  │  ├─ Dashboard.jsx, Temperature.jsx, Refrigerators_backup.jsx, HelpOverlay.jsx
│  │  ├─ Departments.jsx, DepartmentManager.jsx, Cleaning.jsx, CleaningDepartments.jsx
│  │  ├─ Inventory.jsx, Suppliers.jsx, ProductLabels.jsx, StorageManager.jsx
│  │  ├─ NotificationSystem.jsx, AdvancedReporting.jsx, PDFExport.jsx, BackupPanel.jsx
│  │  ├─ SyncManager.jsx, AIAssistant.jsx, AIAssistantSection.jsx
│  │  └─ onboarding-steps/ (BusinessInfoStep.jsx, DepartmentsStep.jsx, ConservationStep.jsx, StaffStep.jsx, TasksStep.jsx, InventoryStep.jsx)
│  ├─ hooks/ (useHaccpData.js, useCan.js)
│  ├─ lib/ (supabase.js)
│  ├─ services/ (dataService.js, supabaseService.js)
│  ├─ utils/ (haccpRules.js, temperatureDatabase.js, permissions.js, presets.js, useHaccpValidation.js, firebase.js)
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ docs/
├─ index.html (carica jsPDF via CDN)
├─ vite.config.js, tailwind.config.js, postcss.config.js
├─ vercel*.json, netlify.toml
└─ test-*.html
Istruzioni

Dove salvarlo: docs/knowledge-base/project_structure.md

Perché: il bot può dire esattamente dove mettere/modificare i file.

Come usarlo: quando chiedi “dove salvo X?”, il bot risponderà usando questa mappa.

Titolo file: docs/knowledge-base/current_goal.md
. Contenuto

# Obiettivo Corrente del Progetto

## OBIETTIVO CORRENTE
*[Scrivi qui l’obiettivo principale attuale]*

**Data Aggiornamento**: [YYYY-MM-DD]  
**Priorità**: [Alta/Media/Bassa]  
**Stato**: [In Corso/Completato/In Pausa/Bloccato]

### Descrizione
*[Dettagli]*

### Criteri di Successo
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## FUNZIONALITÀ IN SVILUPPO
*[Elenco]*

## PROSSIMI TASK
*[Elenco con priorità e stime]*

## BLOCCHI E PROBLEMI
*[Elenco]*

## RISORSE E DIPENDENZE
*[Elenco]*

## METRICHE E KPI
*[Definisci metriche]*

## NOTE
*[Note tecniche/HACCP]*
Istruzioni

Dove salvarlo: docs/knowledge-base/current_goal.md

Perché: il bot capisce cosa è prioritario ora e adatta le risposte.

Come usarlo: aggiornalo quando cambi obiettivo; cita il file al bot se vuoi che tenga conto delle nuove priorità.

Istruzioni generali (da dove partire, come proseguire, cosa ottenere)
1) Da dove partire (oggi)
Crea le cartelle:
docs/knowledge-base/ e docs/agent/

Salva tutti i file sopra nei rispettivi percorsi.

Nel tuo modello DeepSeek:

imposta il Prompt di Sistema usando docs/agent/prompts.md (sezione SYSTEM)

se la UI lo consente, allega docs/knowledge-base/KB_SINGLE_FILE.md alla chat

2) Come proseguire (questa settimana)
Usa i template in docs/agent/prompts.md per creare:

nuovi User, Department, ConservationPoint, CleaningTask…

TemperatureRecord coerenti con le regole

Se vuoi popolare l’app rapidamente:

Esporta un backup dall’app

Inserisci i JSON creati nelle sezioni corrette (haccp-users, haccp-inventory-products, …)

Re-importa il backup dall’app

3) Cosa dovresti ottenere
Un bot che risponde come se conoscesse il tuo progetto: strutture dati, cartelle, regole HACCP.

JSON conformi agli schemi, pronti per l’import nell’app.

Istruzioni puntuali su dove scrivere/modificare file.

(Quando/Se abiliti RAG) risposte ancora più precise con citazioni della KB.

Se vuoi, nel prossimo messaggio dimmi:

se la tua UI del modello consente allegare file,

se nell’app vedi il pannello Backup/Export,
così ti preparo un esempio di backup pronto da cui partire e un mini-check di import.

Hai detto:
revisiona tutto considerando che userò ollama. 

ad esempio ho rielaborato così il file deepseek_setup.md 

dimmi cosa ne pensi e come possiamo migliorare i file che hai generato : 
fammi domande per capire meglio 

# Guida all'Uso dell'Agente Locale con Ollama

## Prerequisiti
- Ollama installato e in esecuzione.
- Modello deepseek-coder:6.7b-instruct scaricato (o altro modello).
- I file di contesto del progetto nella cartella project_context/.

## Come Comunicare con il Modello

### Opzione 1 — Tramite CLI (Semplice per test)
Apri un terminale e usa il comando ollama run:
bash
# Esempio base
ollama run deepseek-coder:6.7b-instruct "Scrivimi una funzione Python che inverta una stringa."

# Esempio avanzato con contesto from file
# Prima copia il contenuto del file di contesto negli appunti, poi incollalo nel comando.
ollama run deepseek-coder:6.7b-instruct "$(cat ../project_context/tech_stack.md) Ora, crea un componente React per un pulsante primary usando shadcn/ui."
ChatGPT ha detto:

Ragionamento interrotto
Hai detto:
considerando che lavorerò con cursor, e userò ollama non avro problemi ad allegare file alla conversazione. 

rielaboriamo una strategia specifica per questo setup.
fammi domande se hai dubbi
ChatGPT ha detto:

Ragionamento interrotto
ChatGPT ha detto:

Ragionamento interrotto
Hai detto:
considerando che lavorerò con cursor, e userò ollama non avro problemi ad allegare file alla conversazione. rielaboriamo una strategia specifica per questo setup.
ti ho inviato i file presenti nella mia cartella Knowledge Base. ti allego pattern della cartella su mio pc :
C:\Users\matte.MIO\Documents\GitHub\Business-HACCP-manager\docs\Knowledge Base

mantieni lo stesso livello di dettaglio e non trascurare nessuna parola. 
aiutami a modificare i file per far si che siano perfetti con il mio setup
 fammi domande se hai dubbi
ChatGPT ha detto:

Ragionato per 3m 7s
fantastico — dato che userai Cursor + Ollama e puoi allegare file nelle chat, ti preparo una strategia dedicata e ti consegno i file revisionati (titolo → contenuto → istruzioni). Ho adattato nomi di cartelle e percorsi alla tua struttura Windows:

C:\Users\matte.MIO\Documents\GitHub\Business-HACCP-manager\docs\Knowledge Base\
Nota compatibilità: Ollama espone un’API OpenAI-compatible (/v1/chat/completions, base URL tipica http://localhost:11434/v1), così Cursor può puntarci senza plugin strani. 
Ollama
ollama.readthedocs.io
apidog
Elastic

Titolo file: docs\Knowledge Base\KB_SINGLE_FILE.md
. Contenuto

# Business HACCP Manager — Knowledge Base (KB) in un unico file
**Versione:** 1.2 • **Ultimo aggiornamento:** 2025-09-08

Questa è la **base di conoscenza unica** per istruire il tuo agente in Cursor (modello servito via Ollama).
Contiene: istruzioni operative, **Entità & Schemi (COMPLETI)**, regole HACCP, flussi e riferimenti rapidi.

---

## COME USARE QUESTO FILE CON CURSOR + OLLAMA

### Scenario A — Senza RAG (più semplice, subito operativo)
- In **Cursor Chat**, allega/pinna questo file come **Context** (paperclip ➜ scegli file).
- Nel **Prompt di Sistema** (o “Pinned Notes”), scrivi:  
  > Usa come base di verità `docs/Knowledge Base/KB_SINGLE_FILE.md`.  
  > Cita le sezioni con il formato `[§ ...]`.  
  > Produci JSON aderente agli schemi quando richiesto.

### Scenario B — Con RAG (facoltativo)
- Indicizza questo file. Chunk 900 caratteri, overlap 150, top-k 5.  
- Metadati per chunk: `{ file:"KB_SINGLE_FILE.md", headings[], section_id }`.  
- Risposte brevi, operative, **con citazioni** (es. `[§ Entità › Product]`).

---

## INDICE
- [Chiavi di Persistenza (LocalStorage)](#chiavi-di-persistenza-localstorage)
- [Entità & Schemi (COMPLETI)](#entità--schemi-completi)
  - [User](#user)
  - [StaffMember](#staffmember)
  - [Department](#department)
  - [BusinessInfo](#businessinfo)
  - [ConservationPoint](#conservationpoint)
  - [TemperatureRecord](#temperaturerecord)
  - [CleaningTask](#cleaningtask)
  - [Supplier](#supplier)
  - [Order](#order)
  - [Product](#product)
  - [ProductLabel](#productlabel)
  - [LabelGroup](#labelgroup)
  - [Notification](#notification)
  - [ActionLog](#actionlog)
  - [OnboardingState](#onboardingstate)
- [Regole HACCP — Operativo](#regole-haccp--operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA — Considerazioni](#pwa--considerazioni)
- [Esempi pronti all’uso](#esempi-pronti-alluso)

---

## Chiavi di Persistenza (LocalStorage)
Prefisso **`haccp-*`** — usare **solo** `DataService` (mai scrivere direttamente dai componenti).
```js
{
  'haccp-app-data': {...},              // meta versione/migrazioni
  'haccp-users': [...],
  'haccp-current-user': {...},

  'haccp-business-info': {...},
  'haccp-business-data': {...},

  'haccp-departments': [...],
  'haccp-departments-v2': [...],

  'haccp-refrigerators': [...],         // legacy
  'haccp-refrigerators-v2': [...],      // ConservationPoint

  'haccp-staff': [...],
  'haccp-suppliers': [...],
  'haccp-orders': [...],

  'haccp-inventory': [...],             // legacy
  'haccp-inventory-products': [...],    // Product attuale
  'haccp-product-labels': [...],
  'haccp-label-groups': [...],

  'haccp-temperatures': [...],
  'haccp-cleaning': [...],
  'haccp-cleaning-departments': [...],

  'haccp-notifications': [...],
  'haccp-actions': [...],               // audit trail

  'haccp-onboarding': {...},
  'haccp-presets': {...}
}
[§ Persistenza]

Entità & Schemi (COMPLETI)
Gli schemi descrivono cosa deve contenere ogni oggetto. La validazione completa vive in DataService + utils/haccpRules.js.

User
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // multi-tenant cloud
 */
[§ Entità › User]

StaffMember
/**
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} fullName
 * @property {string} role
 * @property {string[]} categories
 * @property {string} certification
 * @property {string} notes
 * @property {string} addedDate   // 'YYYY-MM-DD'
 * @property {string} addedTime   // 'HH:mm'
 * @property {boolean} isRegisteredUser
 * @property {string=} userId
 */
[§ Entità › StaffMember]

Department
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager              // userId o nome
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt            // ISO
 * @property {string} createdBy            // userId
 */
Vincoli: nome unico per companyId; alcuni predefiniti non eliminabili (Banconisti, Cuochi, Amministrazione).
[§ Entità › Department]

BusinessInfo
/**
 * @typedef {Object} BusinessInfo
 * @property {string} companyId
 * @property {string} businessName
 * @property {string} vatNumber
 * @property {string} address
 * @property {string} city
 * @property {string} cap
 * @property {string} countryCode
 * @property {{lat:number, lon:number}=} geo
 * @property {string} createdAt // ISO
 * @property {string} updatedAt // ISO
 */
[§ Entità › BusinessInfo]

ConservationPoint
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
[§ Entità › ConservationPoint]

TemperatureRecord
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // "Frigo A"
 * @property {string} location          // "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
[§ Entità › TemperatureRecord]

CleaningTask
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
[§ Entità › CleaningTask]

Supplier
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
[§ Entità › Supplier]

Order
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} supplierName
 * @property {string} orderDate           // 'YYYY-MM-DD'
 * @property {string} notes
 * @property {string} createdAt           // ISO
 */
[§ Entità › Order]

Product
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate          // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate   // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId   // Order.id
 * @property {string} createdAt           // ISO
 */
Esempio

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
[§ Entità › Product]

ProductLabel
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode
 * @property {string} createdAt
 * @property {string} expiresAt
 * @property {boolean} archived
 */
[§ Entità › ProductLabel]

LabelGroup
/**
 * @typedef {Object} LabelGroup
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} createdAt
 * @property {boolean} autoCleanup
 */
[§ Entità › LabelGroup]

Notification
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId
 * @property {string} createdAt
 * @property {boolean} read
 */
[§ Entità › Notification]

ActionLog
/**
 * @typedef {Object} ActionLog
 * @property {string} id
 * @property {string} actorId
 * @property {string} action
 * @property {string} entity
 * @property {string} entityId
 * @property {object} meta
 * @property {string} createdAt
 */
[§ Entità › ActionLog]

OnboardingState
/**
 * @typedef {Object} OnboardingState
 * @property {{confirmed:boolean, data:any}} businessInfo
 * @property {{confirmed:boolean, data:any}} departments
 * @property {{confirmed:boolean, data:any}} conservation
 * @property {{confirmed:boolean, data:any}} staff
 * @property {{confirmed:boolean, data:any}} tasks
 * @property {{confirmed:boolean, data:any}} inventory
 * @property {string} updatedAt // ISO
 */
[§ Entità › OnboardingState]

Regole HACCP — Operativo
Range Temperature (in utils/temperatureDatabase.js)

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules.

Compatibilità: vietata mescolanza categorie incompatibili nello stesso punto.

Status (ok|warning|danger): calcolato da value vs range + tolleranza.

Pulizie: frequency → prossimi task; ritardi ⇒ warning.
[§ Regole HACCP]

Onboarding & Validazioni
Wizard (components/onboarding-steps/): BusinessInfo → Departments → Conservation → Staff → Tasks → Inventory.
Gating: useHaccpValidation + haccpRules; stato step “confermato/non confermato”.
[§ Onboarding]

Flusso di Persistenza
UI → DataService (read/write)

DataService → valida, migra/merge, salva, logga in haccp-actions

Sync (simulato) → SyncManager → supabaseService (gating companyId)

Backup/Export → BackupPanel produce haccp-backup-YYYY-MM-DD.json
[§ Persistenza]

Notifiche & De-dup
Alert per: temperature fuori range, scadenze, pulizie non eseguite.

De-dup per (type + dataId).
[§ Notifiche]

Access Control
Hook useCan: ruolo (admin|responsabile|dipendente|collaboratore), reparto, ownership.

Azioni critiche (delete/export/sync) → permessi elevati.
[§ Access Control]

PWA — Considerazioni
Cache offline in public/sw.js.

Prompt install personalizzato.

In dev: main.jsx deregistra SW preesistenti.
[§ PWA]

Esempi pronti all’uso
“Genera TemperatureRecord per Frigo A con 3.8°C ora, status coerente.” → [§ TemperatureRecord], [§ Regole HACCP]

“Uniforma questi Product allo schema e riempi i campi mancanti.” → [§ Product]

“Crea CleaningTask settimanale per Cucina (Alta).” → [§ CleaningTask]


**_Istruzioni (come usarlo, dove salvarlo, perché)_**  
- **Dove:** `docs\Knowledge Base\KB_SINGLE_FILE.md`  
- **Perché:** è la **fonte unica** che il bot userà per capire dati, regole e flussi.  
- **Come:** in **Cursor**, allega/pinna questo file alla chat. Se abiliti RAG più avanti, indicizza solo questo file.

---

## _Titolo file_: `docs\agent\cursor_ollama_setup.md`  
**. Contenuto**
```markdown
# Setup specifico: Cursor + Ollama

## 1) Prepara Ollama
```bash
# installa ollama, poi:
ollama pull deepseek-coder:6.7b-instruct   # modello leggero per coding
# (opzionale) altri modelli:
# ollama pull deepseek-v3:7b
# ollama pull qwen2.5-coder:7b
Avvia il server (di solito parte da solo):

ollama serve   # espone l'API su http://localhost:11434
2) Configura Cursor
Apri Cursor → Settings → Models

Opzione A: se vedi Ollama (Local), selezionalo e scegli il modello deepseek-coder:6.7b-instruct.

Opzione B: OpenAI-compatible custom:

Base URL: http://localhost:11434/v1

API Key: qualunque stringa (non valida, è ignorata da Ollama) oppure lascia vuoto se consentito

Model (nome esatto): deepseek-coder:6.7b-instruct

Cursor invierà richieste allo schema /v1/chat/completions; Ollama è compatibile.

3) Aggiungi la Knowledge Base alla chat
Apri la chat di Cursor, clicca paperclip ➜ Add context ➜ seleziona:

docs/Knowledge Base/KB_SINGLE_FILE.md

(opzionale) anche TECH_STACK.MD, PROJECT_STRUCTURE.MD, CODE_STYLE_RULES.MD

Pinna i file se vuoi che restino sempre attivi nella conversazione.

4) Prompt di Sistema consigliato (incollalo nelle “Pinned Notes”)
Sei “Business HACCP Manager – Dev Copilot”.
Usa come base di verità: docs/Knowledge Base/KB_SINGLE_FILE.md.
Segui code style (apostrofi singoli, destructuring) e cita sezioni KB con [§ …].
Per dati HACCP, rispondi con JSON conforme agli schemi.
5) Test rapido
Chiedi:

Crea un TemperatureRecord per “Frigo A” ora con value=3.8°C e calcola lo status secondo la KB. Output: JSON.
Atteso: JSON valido + status ok.


**_Istruzioni_**  
- **Dove:** `docs\agent\cursor_ollama_setup.md`  
- **Perché:** guida passo-passo per far parlare Cursor con Ollama usando la tua KB.  
- **Come:** segui i 5 passi; poi usa i template in `prompts.md`.

---

## _Titolo file_: `docs\agent\prompts.md`  
**. Contenuto**
```markdown
# Prompt Templates — Cursor + Ollama

## SYSTEM (da mettere nelle Pinned Notes della chat)
Sei “Business HACCP Manager – Dev Copilot”.
Usa come base di verità `docs/Knowledge Base/KB_SINGLE_FILE.md`.
Quando generi dati, produci **solo JSON** conforme agli schemi e cita la KB con [§ …].

## USER — Template rapidi

### 1) Crea utente
Crea un **User**:
- Nome: {{NOME}}, PIN: {{PIN}}, ruolo: {{RUOLO}}, reparto: {{REPARTO}}
- Genera id, createdAt, isActive=true.
Output: **solo JSON**.  
_Rif: [§ Entità › User]_

### 2) Nuovo punto conservazione
Crea **ConservationPoint** “{{NOME}}” in “{{LOCATION}}”, type “{{TIPO}}”, targetTemp={{TEMP}}.
Seleziona categorie compatibili e `compliance.isValid=true`.  
Output: **solo JSON**.  
_Rif: [§ Entità › ConservationPoint]_

### 3) Registrazione temperatura
Genera **TemperatureRecord** per “{{FRIGO}}” con value={{VAL}} °C ora, operator “{{OPERATORE}}”.
Calcola `status` secondo le regole.  
Output: **solo JSON**.  
_Rif: [§ Entità › TemperatureRecord], [§ Regole HACCP]_

### 4) Task pulizia
Crea **CleaningTask** {{FREQUENZA}} “{{TASK}}” per “{{REPARTO}}”, priorità “{{PRIORITA}}”.  
Output: **solo JSON**.  
_Rif: [§ Entità › CleaningTask]_

### 5) Normalizza prodotti
Uniforma questi **Product** allo schema e riempi i campi mancanti.  
Output: **array JSON**.  
_Rif: [§ Entità › Product]_
Istruzioni

Dove: docs\agent\prompts.md

Perché: copioni pronti da usare nelle chat Cursor.

Come: copia il template, sostituisci {{...}}, incolla in chat.

Titolo file: docs\Knowledge Base\TECH_STACK.MD (REVISIONATO per Ollama + Cursor)
. Contenuto

# Tech Stack — Business HACCP Manager (rev. Ollama + Cursor)

- **SPA**: React 18.2.0 + Vite 4.4.5 (plugin React 4.0.3) — JavaScript (no TypeScript)
- **UI**: Tailwind 3.3.3, PostCSS 8.4.27, Autoprefixer 10.4.14, Lucide React 0.263.1
- **PWA**: `public/manifest.json`, `public/sw.js` (in dev: deregistra SW in `main.jsx`)
- **PDF**: jsPDF 3.0.1 **via CDN** in `index.html`
- **Persistenza**: LocalStorage (`haccp-*`) tramite `src/services/dataService.js`
- **Cloud (placeholder)**: Supabase (`src/lib/supabase.js`, `src/services/supabaseService.js`), Firebase config (non vincolanti)
- **Navigazione**: **no** `react-router-dom`; tab/stati interni in `App.jsx`

## Integrazione LLM (Cursor + Ollama)
- **Server locale**: Ollama su `http://localhost:11434`
- **API**: OpenAI-compatible `http://localhost:11434/v1` (Chat Completions)
- **Modello consigliato per coding**: `deepseek-coder:6.7b-instruct` (reale e veloce in locale)
- **Contesto**: allega/pinna `KB_SINGLE_FILE.md` in Cursor; opzionale RAG in futuro
Istruzioni

Dove: docs\Knowledge Base\TECH_STACK.MD (sovrascrivi il tuo)

Perché: lo stack ora include come usi Cursor + Ollama.

Come: il bot userà queste info quando chiedi “come configuro il modello?”.

Titolo file: docs\Knowledge Base\PROJECT_STRUCTURE.MD (ALLINEATO ai path reali)
. Contenuto

# Struttura del Progetto (mappa aggiornata)

Business-HACCP-manager/
├─ public/ (manifest.json, sw.js, icons/, assets/help/fridge/)
├─ src/
│  ├─ components/ (feature + UI)
│  │  ├─ ui/ (Button.jsx, Card.jsx, Input.jsx, Label.jsx, Tabs.jsx, TemperatureInput.jsx)
│  │  ├─ Dashboard.jsx, Temperature.jsx, Refrigerators_backup.jsx, HelpOverlay.jsx
│  │  ├─ Departments.jsx, DepartmentManager.jsx, Cleaning.jsx, CleaningDepartments.jsx
│  │  ├─ Inventory.jsx, Suppliers.jsx, ProductLabels.jsx, StorageManager.jsx
│  │  ├─ NotificationSystem.jsx, AdvancedReporting.jsx, PDFExport.jsx, BackupPanel.jsx
│  │  ├─ SyncManager.jsx, AIAssistant.jsx, AIAssistantSection.jsx
│  │  └─ onboarding-steps/ (BusinessInfoStep.jsx, DepartmentsStep.jsx, ConservationStep.jsx, StaffStep.jsx, TasksStep.jsx, InventoryStep.jsx)
│  ├─ hooks/ (useHaccpData.js, useCan.js)
│  ├─ lib/ (supabase.js)
│  ├─ services/ (dataService.js, supabaseService.js)
│  ├─ utils/ (haccpRules.js, temperatureDatabase.js, permissions.js, presets.js, useHaccpValidation.js, firebase.js)
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ docs/
│  ├─ Knowledge Base/
│  │  ├─ KB_SINGLE_FILE.md
│  │  ├─ TECH_STACK.MD
│  │  ├─ PROJECT_STRUCTURE.MD
│  │  ├─ CODE_STYLE_RULES.MD
│  │  ├─ KEY_CONCEPTS.MD
│  │  ├─ TEMPERATURE_VALIDATION_IMPLEMENTATION.md
│  │  ├─ DEPARTMENTS_SYSTEM_DOCUMENTATION.md
│  │  └─ CURRENT_GOAL.MD
│  └─ agent/
│     ├─ cursor_ollama_setup.md
│     └─ prompts.md
├─ index.html (carica jsPDF via CDN)
├─ vite.config.js, tailwind.config.js, postcss.config.js
├─ vercel*.json, netlify.toml
└─ test-*.html
Istruzioni

Dove: docs\Knowledge Base\PROJECT_STRUCTURE.MD

Perché: riflette esattamente i path che usi (compreso lo spazio in “Knowledge Base”).

Come: il bot userà questa mappa per dirti dove salvare/modificare file.

Titolo file: docs\Knowledge Base\CODE_STYLE_RULES.MD
. Contenuto

# Regole di Stile e Convenzioni (confermate)

- Componenti: **PascalCase** (1 file = 1 componente)
- Hook custom: prefisso `use` (es. `useCan`, `useHaccpData`)
- Variabili/funzioni: **camelCase**; costanti: **SCREAMING_SNAKE_CASE**
- Stringhe: **apostrofi singoli**
- Props: **destructuring obbligatorio**
- Import order: librerie → componenti → servizi/utils → stili
- Stato: `useState`, `useEffect` con dependency array; `useCallback`/`useMemo` ove sensato
- Error handling: try/catch per IO, fallback sicuri; log `console.warn|error`
- Validazioni: schema-level per dati critici; evita `dangerouslySetInnerHTML`
- UX: conferma per azioni distruttive; badge `ok|warning|danger` coerenti
Istruzioni

Dove: docs\Knowledge Base\CODE_STYLE_RULES.MD

Perché: coerenza negli snippet che il bot scriverà.

Come: il bot deve attenersi a queste regole quando propone codice.

Titolo file: docs\Knowledge Base\KEY_CONCEPTS.MD (AGGIORNATO FULL)
. Contenuto

# Concetti Fondamentali — (estratto sincronizzato con KB_SINGLE_FILE.md)

> Per evitare divergenze, questo file replica le **Entità & Schemi (COMPLETI)** presenti in `KB_SINGLE_FILE.md`.
> Se aggiorni qui, aggiorna anche lì.

[Contiene le stesse sezioni: User, StaffMember, Department, BusinessInfo, ConservationPoint, TemperatureRecord, CleaningTask, Supplier, Order, Product, ProductLabel, LabelGroup, Notification, ActionLog, OnboardingState + regole HACCP, onboarding, persistenza, notifiche, access control, PWA.]
Istruzioni

Dove: docs\Knowledge Base\KEY_CONCEPTS.MD

Perché: per consulto rapido (duplicato “allineato” alla KB unica).

Come: mantienilo coerente con KB_SINGLE_FILE.md.

Titolo file: docs\Knowledge Base\TEMPERATURE_VALIDATION_IMPLEMENTATION.md (RIFINITO)
. Contenuto

# Implementazione Validazione Temperature — Operativo

## Requisiti
- Regole/Range in `utils/temperatureDatabase.js`
- Logica decisione in `utils/haccpRules.js`
- UI input uniforme: `components/ui/TemperatureInput.jsx`

## Regola di stato
if (value entro range) → status = 'ok'
else if (value entro range ± tol) → status = 'warning'
else status = 'danger'


## Pseudocodice (haccpRules.js)
```js
export function computeTempStatus({ type, value, tolerance = 2 }) {
  const { min, max } = getRangeForType(type); // from temperatureDatabase
  if (value >= min && value <= max) return 'ok';
  if (value >= min - tolerance && value <= max + tolerance) return 'warning';
  return 'danger';
}
Punti d’integrazione
Inventory.jsx

handleAddProduct, handleEdit, reinsertUsedIngredient

rifiuta inserimento se danger (bloccante); avvisa se warning

suggerisci PDC con getAppropriateRefrigerator (compatibilità + range)

Temperature.jsx

calcola status in salvataggio misura

suggerisci azioni correttive (es. verifica guarnizioni, carico frigo)

Test manuale
Inserisci valore −16 su freezer → atteso ok|warning a seconda della tolleranza

Inserisci +10 su frigo → danger con blocco e messaggio chiaro


**_Istruzioni_**  
- **Dove:** `docs\Knowledge Base\TEMPERATURE_VALIDATION_IMPLEMENTATION.md`  
- **Perché:** guida implementativa, utile al bot per risposte tecniche.  
- **Come:** usalo quando chiedi al bot correzioni sulla logica di validazione.

---

## _Titolo file_: `docs\Knowledge Base\DEPARTMENTS_SYSTEM_DOCUMENTATION.md` (COMPLETATO)  
**. Contenuto**
```markdown
# Sistema Reparti — Documentazione completa

## Funzioni chiave
- **CRUD** reparti con nomi unici per company
- **Reparti predefiniti non eliminabili**: Banconisti, Cuochi, Amministrazione
- **Assegnazione pulizie** per department.id (vedi `CleaningDepartments.jsx`)
- **Validazioni**: unicità, integrità referenziale su staff/task

## Data model (Department)
```js
{ id, name, description, location, manager, notes, enabled, isCustom, createdAt, createdBy }
Default
[
  { id:'banconisti', name:'Banconisti', enabled:true, isCustom:false },
  { id:'cuochi',     name:'Cuochi',     enabled:true, isCustom:false },
  { id:'admin',      name:'Amministrazione', enabled:true, isCustom:false }
]
Invarianti
Non consentita eliminazione dei predefiniti

Nomi unici (case-insensitive) per companyId

Task pulizie possono riferirsi a assignee = department.id

UI note
Vista admin dedicata per CRUD

Messaggi chiari in caso di conflitto nome/eliminazione bloccata


**_Istruzioni_**  
- **Dove:** `docs\Knowledge Base\DEPARTMENTS_SYSTEM_DOCUMENTATION.md`  
- **Perché:** dettaglia regole ed edge case.  
- **Come:** il bot lo userà per operazioni su reparti e pulizie per reparto.

---

## _Titolo file_: `docs\Knowledge Base\CURRENT_GOAL.MD`  
**. Contenuto**
```markdown
# Obiettivo Corrente del Progetto

## OBIETTIVO CORRENTE
*[Scrivi qui l’obiettivo principale attuale]*

**Data Aggiornamento**: [YYYY-MM-DD]  
**Priorità**: [Alta/Media/Bassa]  
**Stato**: [In Corso/Completato/In Pausa/Bloccato]

### Descrizione
*[Dettagli]*

### Criteri di Successo
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

## FUNZIONALITÀ IN SVILUPPO
*[Elenco]*

## PROSSIMI TASK
*[Elenco con priorità e stime]*

## BLOCCHI E PROBLEMI
*[Elenco]*

## RISORSE E DIPENDENZE
*[Elenco]*

## METRICHE E KPI
*[Definisci metriche]*

## NOTE
*[Note tecniche/HACCP]*
Istruzioni

Dove: docs\Knowledge Base\CURRENT_GOAL.MD

Perché: allinea il bot alle priorità attuali.

Come: aggiornalo; in chat scrivi “considera l’ultimo CURRENT_GOAL.MD”.

Titolo file: docs\Knowledge Base\Manuale_Per_IA.md (GUIDA USO semplificata per te)
. Contenuto

# Manuale rapido — Come usare la KB con Cursor + Ollama

## Non serve programmare
- Non creare file separati per ogni entità.
- Gli schemi sono **forme** per il bot, non codice eseguibile.

## Passi
1. Allegare/pinnare `KB_SINGLE_FILE.md` alla chat di Cursor.
2. Incollare nelle Pinned Notes il **SYSTEM** da `docs/agent/prompts.md`.
3. Copiare i template **USER** da `docs/agent/prompts.md` e incollarli in chat.

## Inserire dati nell’app (senza codice)
- **Via UI**: usa le schermate Staff/Inventario.
- **Via Backup**:
  1) Esporta backup  
  2) Aggiungi oggetti JSON nelle sezioni giuste (`haccp-users`, `haccp-inventory-products`, …)  
  3) Re-importa il file  
  4) Verifica

## Frasi pronte
- “Crea un `User` per Anna Verdi… Output solo JSON.”  
- “Normalizza questi `Product` secondo schema… Output array JSON.”  
- “Registra temperatura per Frigo A 3.8°C… calcola status.”

> Quando hai dubbi, chiedi al bot: “Correggi **al minimo** per aderire alla KB e spiega cosa hai cambiato.”
Istruzioni

Dove: docs\Knowledge Base\Manuale_Per_IA.md

Perché: guida non tecnica per il tuo uso quotidiano.

Come: tienilo a portata; incolla i prompt da qui.

Istruzioni generali (da dove partire, come proseguire, cosa ottenere)
Partire (oggi)

Metti i file sopra nelle cartelle esattamente come indicato.

In Cursor, pinna KB_SINGLE_FILE.md e incolla il SYSTEM dalle Pinned Notes.

Esegui ollama pull deepseek-coder:6.7b-instruct e assicurati che Ollama risponda su http://localhost:11434/v1.

Proseguire (questa settimana)

Usa i template di prompts.md per creare User, Departments, ConservationPoint, CleaningTask, TemperatureRecord.

Se vuoi popolare in blocco: esporta backup ➜ inserisci JSON nelle sezioni (haccp-*) ➜ re-importa.

Obiettivo (cosa otterrai)

Un agente in Cursor che conosce dati, regole e struttura del tuo progetto.

JSON conformi pronti per l’import.

Istruzioni puntuali su dove intervenire nei file e come rispettare HACCP.

5 domande mirate (sì/no o risposta breve)
In Cursor vedi l’opzione Ollama (Local) o usi OpenAI-compatible base URL?

Confermi che il modello principale sarà deepseek-coder:6.7b-instruct per coding? (eventuali altri modelli?)

Vuoi anche attivare un RAG semplice in futuro (indicizzazione di KB_SINGLE_FILE.md), o restiamo su context file + prompt?

Confermi che userai soprattutto l’import via Backup per caricare i JSON generati?

Vuoi che aggiunga few-shot specifici per: PDFExport, SyncManager, Departments non eliminabili?

Appena mi rispondi a queste 5, ti preparo eventuali aggiunte (es. few_shots.md, mini-script di import, checklist di validazione pre-audit).

Hai detto:
KB_SINGLE_FILE.md
File
questo è il mio attuale file KB_SINGLE_FILE.MD 

dimmi se va bene 
ChatGPT ha detto:

Ragionato per 1m 10s
grazie! l’ho letto: così com’è, il tuo KB_SINGLE_FILE.md non va bene come “base unica”.
È in pratica un manuale d’uso (spiega “come usare la KB”) ma non contiene le Entità & Schemi, le regole HACCP, i flussi, ecc. — cioè proprio ciò che il bot deve conoscere per lavorare sul progetto. Lo si vede già dall’incipit “Come usare la Knowledge Base …” e dall’assenza di sezioni tecniche. 
KB_SINGLE_FILE


Quei contenuti tecnici oggi sono sparsi in altri file (es. KEY_CONCEPTS.MD), ma lo scopo di KB_SINGLE_FILE.md è accorparli in un unico riferimento.

qui sotto ti do una versione pronta da incollare e sovrascrivere.

Titolo file: docs\Knowledge Base\KB_SINGLE_FILE.md
. Contenuto (SOSTITUISCI TUTTO)

# Business HACCP Manager — Knowledge Base (KB) in un unico file
**Versione:** 1.2 • **Ultimo aggiornamento:** 2025-09-08

Questa è la **base di conoscenza unica** per istruire il tuo agente in Cursor (modello servito via Ollama).
Contiene: istruzioni operative, **Entità & Schemi (COMPLETI)**, regole HACCP, flussi e riferimenti rapidi.

---

## COME USARE QUESTO FILE CON CURSOR + OLLAMA

### Scenario A — Senza RAG (più semplice, subito operativo)
- In **Cursor Chat**, allega/pinna questo file come **Context** (paperclip ➜ scegli file).
- Nelle **Pinned Notes** (Prompt di Sistema), scrivi:
  > Usa come base di verità `docs/Knowledge Base/KB_SINGLE_FILE.md`.  
  > Cita le sezioni con il formato `[§ ...]`.  
  > Per dati, produci **solo JSON** aderente agli schemi.

### Scenario B — Con RAG (facoltativo)
- Indicizza questo file. Chunk 900 caratteri, overlap 150, top-k 5.  
- Metadati per chunk: `{ file:"KB_SINGLE_FILE.md", headings[], section_id }`.  
- Risposte brevi, operative, **con citazioni** (es. `[§ Entità › Product]`).

---

## INDICE
- [Chiavi di Persistenza (LocalStorage)](#chiavi-di-persistenza-localstorage)
- [Entità & Schemi (COMPLETI)](#entità--schemi-completi)
  - [User](#user)
  - [StaffMember](#staffmember)
  - [Department](#department)
  - [BusinessInfo](#businessinfo)
  - [ConservationPoint](#conservationpoint)
  - [TemperatureRecord](#temperaturerecord)
  - [CleaningTask](#cleaningtask)
  - [Supplier](#supplier)
  - [Order](#order)
  - [Product](#product)
  - [ProductLabel](#productlabel)
  - [LabelGroup](#labelgroup)
  - [Notification](#notification)
  - [ActionLog](#actionlog)
  - [OnboardingState](#onboardingstate)
- [Regole HACCP — Operativo](#regole-haccp--operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA — Considerazioni](#pwa--considerazioni)
- [Esempi pronti all’uso](#esempi-pronti-alluso)

---

## Chiavi di Persistenza (LocalStorage)
Prefisso **`haccp-*`** — usare **solo** `DataService` (mai scrivere direttamente dai componenti).
```js
{
  'haccp-app-data': {...},              // meta versione/migrazioni
  'haccp-users': [...],
  'haccp-current-user': {...},

  'haccp-business-info': {...},
  'haccp-business-data': {...},

  'haccp-departments': [...],
  'haccp-departments-v2': [...],

  'haccp-refrigerators': [...],         // legacy
  'haccp-refrigerators-v2': [...],      // ConservationPoint

  'haccp-staff': [...],
  'haccp-suppliers': [...],
  'haccp-orders': [...],

  'haccp-inventory': [...],             // legacy
  'haccp-inventory-products': [...],    // Product attuale
  'haccp-product-labels': [...],
  'haccp-label-groups': [...],

  'haccp-temperatures': [...],
  'haccp-cleaning': [...],
  'haccp-cleaning-departments': [...],

  'haccp-notifications': [...],
  'haccp-actions': [...],               // audit trail

  'haccp-onboarding': {...},
  'haccp-presets': {...}
}
[§ Persistenza]

Entità & Schemi (COMPLETI)
Gli schemi descrivono cosa deve contenere ogni oggetto. La validazione completa vive in DataService + utils/haccpRules.js.

User
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} pin
 * @property {'admin'|'responsabile'|'dipendente'|'collaboratore'} role
 * @property {string} department
 * @property {string} createdAt   // ISO
 * @property {boolean} isActive
 * @property {string=} companyId  // multi-tenant cloud
 */
[§ Entità › User]

StaffMember
/**
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} fullName
 * @property {string} role
 * @property {string[]} categories
 * @property {string} certification
 * @property {string} notes
 * @property {string} addedDate   // 'YYYY-MM-DD'
 * @property {string} addedTime   // 'HH:mm'
 * @property {boolean} isRegisteredUser
 * @property {string=} userId
 */
[§ Entità › StaffMember]

Department
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager              // userId o nome
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt            // ISO
 * @property {string} createdBy            // userId
 */
Vincoli: nome unico per companyId; alcuni predefiniti non eliminabili (Banconisti, Cuochi, Amministrazione).
[§ Entità › Department]

BusinessInfo
/**
 * @typedef {Object} BusinessInfo
 * @property {string} companyId
 * @property {string} businessName
 * @property {string} vatNumber
 * @property {string} address
 * @property {string} city
 * @property {string} cap
 * @property {string} countryCode
 * @property {{lat:number, lon:number}=} geo
 * @property {string} createdAt // ISO
 * @property {string} updatedAt // ISO
 */
[§ Entità › BusinessInfo]

ConservationPoint
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
[§ Entità › ConservationPoint]

TemperatureRecord
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {number} timestamp         // epoch ms
 * @property {string} refrigerator      // "Frigo A"
 * @property {string} location          // "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value             // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
Esempio

{
  id: 1735712345678,
  date: '08/09/2025',
  timestamp: 1735712345678,
  refrigerator: 'Frigo A',
  location: 'Cucina / Frigo A',
  type: 'frigo',
  value: 4.3,
  unit: '°C',
  operator: 'Mario Rossi',
  notes: '',
  status: 'ok'
}
[§ Entità › TemperatureRecord]

CleaningTask
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date              // 'gg/mm/aaaa'
 * @property {boolean} completed
 * @property {string|null} completedAt  // ISO o null
 * @property {string|null} completedBy  // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
[§ Entità › CleaningTask]

Supplier
/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} vat
 * @property {string} phone
 * @property {string} email
 * @property {string} notes
 * @property {string} createdAt
 */
[§ Entità › Supplier]

Order
/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} supplierName
 * @property {string} orderDate           // 'YYYY-MM-DD'
 * @property {string} notes
 * @property {string} createdAt           // ISO
 */
[§ Entità › Order]

Product
/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} category
 * @property {string} department
 * @property {string} conservationPoint
 * @property {string} expiryDate          // 'YYYY-MM-DD'
 * @property {string[]} allergens
 * @property {string} notes
 * @property {string} lotNumber
 * @property {string} batchDeliveryDate   // 'YYYY-MM-DD'
 * @property {string} supplierName
 * @property {string} associatedOrderId   // Order.id
 * @property {string} createdAt           // ISO
 */
Esempio

{
  name: 'Mozzarella',
  category: 'Latticini',
  department: 'Cucina',
  conservationPoint: 'Frigo A',
  expiryDate: '2025-09-30',
  allergens: ['latte'],
  notes: '',
  lotNumber: 'L2025-09-001',
  batchDeliveryDate: '2025-09-07',
  supplierName: 'Caseificio X',
  associatedOrderId: 'ORD-123'
}
[§ Entità › Product]

ProductLabel
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode
 * @property {string} createdAt
 * @property {string} expiresAt
 * @property {boolean} archived
 */
[§ Entità › ProductLabel]

LabelGroup
/**
 * @typedef {Object} LabelGroup
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} createdAt
 * @property {boolean} autoCleanup
 */
[§ Entità › LabelGroup]

Notification
/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {'temperature'|'expiry'|'cleaning'|'system'} type
 * @property {string} title
 * @property {string} message
 * @property {string} dataId
 * @property {string} createdAt
 * @property {boolean} read
 */
``]
[§ Entità › Notification]

### ActionLog
```js
/**
 * @typedef {Object} ActionLog
 * @property {string} id
 * @property {string} actorId
 * @property {string} action
 * @property {string} entity
 * @property {string} entityId
 * @property {object} meta
 * @property {string} createdAt
 */
[§ Entità › ActionLog]

OnboardingState
/**
 * @typedef {Object} OnboardingState
 * @property {{confirmed:boolean, data:any}} businessInfo
 * @property {{confirmed:boolean, data:any}} departments
 * @property {{confirmed:boolean, data:any}} conservation
 * @property {{confirmed:boolean, data:any}} staff
 * @property {{confirmed:boolean, data:any}} tasks
 * @property {{confirmed:boolean, data:any}} inventory
 * @property {string} updatedAt // ISO
 */
[§ Entità › OnboardingState]

Regole HACCP — Operativo
Range Temperature (in utils/temperatureDatabase.js)

fresh_meat: 0..4 °C

fresh_fish: 0..2 °C

fresh_dairy: 2..4 °C

fresh_vegetables: 2..8 °C

frozen: −18..−15 °C

cooked_hold: 60..65 °C

Tolleranza: configurabile (es. ±2 °C) in haccpRules.

Compatibilità: vietata mescolanza categorie incompatibili nello stesso punto.

Status (ok|warning|danger): calcolato da value vs range + tolleranza.

Pulizie: frequency → prossimi task; ritardi ⇒ warning.
[§ Regole HACCP]

Onboarding & Validazioni
Wizard (components/onboarding-steps/): BusinessInfo → Departments → Conservation → Staff → Tasks → Inventory.
Gating: useHaccpValidation + haccpRules; stato step “confermato/non confermato”.
[§ Onboarding]

Flusso di Persistenza
UI → DataService (read/write)

DataService → valida, migra/merge, salva, logga in haccp-actions

Sync (simulato) → SyncManager → supabaseService (gating companyId)

Backup/Export → BackupPanel produce haccp-backup-YYYY-MM-DD.json
[§ Persistenza]

Notifiche & De-dup
Alert per: temperature fuori range, scadenze, pulizie non eseguite.

De-dup per (type + dataId).
[§ Notifiche]

Access Control
Hook useCan: ruolo (admin|responsabile|dipendente|collaboratore), reparto, ownership.

Azioni critiche (delete/export/sync) → permessi elevati.
[§ Access Control]

PWA — Considerazioni
Cache offline in public/sw.js.

Prompt install personalizzato.

In dev: main.jsx deregistra SW preesistenti.
[§ PWA]

Esempi pronti all’uso
“Genera TemperatureRecord per Frigo A con 3.8°C ora, status coerente.” → [§ TemperatureRecord], [§ Regole HACCP]

“Uniforma questi Product allo schema e riempi i campi mancanti.” → [§ Product]

“Crea CleaningTask settimanale per Cucina (Alta).” → [§ CleaningTask]


_Istruzioni (come usarlo, dove salvarlo, perché)_  
- **Dove salvarlo:** `C:\Users\matte.MIO\Documents\GitHub\Business-HACCP-manager\docs\Knowledge Base\KB_SINGLE_FILE.md`  
- **Perché:** è la **fonte unica** che Cursor userà come contesto quando parli col modello via Ollama.  
- **Come usarlo:** in **Cursor**, allega/pinna questo file alla chat. (Se in futuro fai RAG, indicizza solo questo file.)

---

vuoi che ti prepari un “diff” minimale per **spostare** il contenuto attuale (che è un manuale) in `docs\Knowledge Base\Manuale_Per_IA.md` e sostituire `KB_SINGLE_FILE.md` con quello sopra? Oppure procedo direttamente fornendoti anche il **prompt di sistema** pronto da incollare nelle Pinned Notes?
::contentReference[oaicite:2]{index=2}

Fonti



Nessun file selezionatoNessun file selezionato
ChatGPT può commettere errori. Assicurati di verificare le informazioni importanti. Vedi Preferenze sui cookie.
