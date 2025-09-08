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
