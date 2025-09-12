
# Business HACCP Manager — Knowledge Base (KB)
**Versione:** 1.2 • **Ultimo aggiornamento:** 2025-09-12

> SPA React + Vite (JS, no TypeScript), TailwindCSS, PWA (Manifest + Service Worker), dati in LocalStorage tramite **DataService**, integrazioni cloud predisposte (Supabase/Firebase) ma **non** vincolanti ai flussi principali. Navigazione a tab in `App.jsx` (no react-router-dom). Export PDF via **jsPDF da CDN** in `index.html`.

---

## Come usare questa KB (2 modi)

### A) Senza RAG (subito)
Metti nel modello questo **System Prompt**:
> Sei “Business HACCP Manager – Dev Copilot” (italiano).  
> Usa come base di verità: `/docs/knowledge-base/KB_SINGLE_FILE.md`.  
> Segui le convenzioni di stile (apostrofi singoli, destructuring).  
> Per i dati, rispetta gli **schemi** qui definiti.  
> Cita la sezione KB con `[§ ...]`.  
> Per HACCP, esplicita `ok|warning|danger`.

Se la UI permette **allegati**, allega questo file.

### B) Con RAG (opzionale)
Indicizza **questo file** con: chunk **900** caratteri, overlap **150**, top-k **5**.  
Metadati chunk: `{ file: "KB_SINGLE_FILE.md", headings[], section_id }`.  
Componi risposte brevi citando `[§ ...]`.

---

## Indice
- [Persistenza (LocalStorage)](#persistenza-localstorage)
- [Entità & Schemi (COMPLETI)](#entità--schemi-completi)
  - [User](#user) · [StaffMember](#staffmember) · [Department](#department) · [BusinessInfo](#businessinfo)  
  - [ConservationPoint](#conservationpoint) · [TemperatureRecord](#temperaturerecord)  
  - [CleaningTask](#cleaningtask) · [Supplier](#supplier) · [Order](#order)  
  - [Product](#product) · [ProductLabel](#productlabel) · [LabelGroup](#labelgroup)  
  - [Notification](#notification) · [ActionLog](#actionlog) · [OnboardingState](#onboardingstate)
- [Regole HACCP — Operativo](#regole-haccp--operativo)
- [Onboarding & Validazioni](#onboarding--validazioni)
- [Flusso di Persistenza](#flusso-di-persistenza)
- [Notifiche & De-dup](#notifiche--de-dup)
- [Access Control](#access-control)
- [PWA — Note pratiche](#pwa--note-pratiche)
- [Esempi pronti](#esempi-pronti)
- [Glossario veloce](#glossario-veloce)
- [Changelog](#changelog)

---

## Persistenza (LocalStorage)
Prefisso **`haccp-*`** — usa **solo** `src/services/dataService.js` (mai scrivere direttamente).

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
Rif: [§ Persistenza]

## Entità & Schemi (COMPLETI)
Sono forme dei dati. La validazione completa vive in DataService + utils/haccpRules.js.
Lo stile del codice segue apostrofi singoli, destructuring, camelCase/PascalCase.

### User

```js
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
```
Rif: [§ Entità › User]

### StaffMember

```js
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
```

### Department

```js
/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} location
 * @property {string} manager       // userId o nome
 * @property {string} notes
 * @property {boolean} enabled
 * @property {boolean} isCustom
 * @property {string} createdAt     // ISO
 * @property {string} createdBy     // userId
 * // vincoli: nome unico per companyId; alcuni predefiniti non eliminabili
 */
```

### BusinessInfo

```js
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
```

### ConservationPoint

```js
/**
 * @typedef {Object} ConservationPoint
 * @property {string} id
 * @property {string} name                  // es. "Frigo A"
 * @property {string} location
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} targetTemp
 * @property {string[]} selectedCategories  // categorie ammesse
 * @property {{isValid:boolean, errors:string[], warnings:string[]}} compliance
 * @property {string} createdAt
 * @property {string=} notes
 */
```

### TemperatureRecord

```js
/**
 * @typedef {Object} TemperatureRecord
 * @property {number|string} id            // timestamp o uuid
 * @property {string} date                 // 'gg/mm/aaaa'
 * @property {number} timestamp            // epoch ms
 * @property {string} refrigerator         // "Frigo A"
 * @property {string} location             // "Cucina / Frigo A"
 * @property {'frigo'|'freezer'|'abbattitore'|'vetrina'|'dispensa'} type
 * @property {number} value                // °C
 * @property {'°C'|'°F'} unit
 * @property {string} operator
 * @property {string} notes
 * @property {'ok'|'warning'|'danger'} status
 */
```

### CleaningTask

```js
/**
 * @typedef {Object} CleaningTask
 * @property {string|number} id
 * @property {string} task
 * @property {string} assignee             // id utente o nome reparto
 * @property {'giornaliera'|'settimanale'|'mensile'|'una_tantum'} frequency
 * @property {string} date                 // 'gg/mm/aaaa' prossima scadenza
 * @property {boolean} completed
 * @property {string|null} completedAt     // ISO o null
 * @property {string|null} completedBy     // userId o null
 * @property {'Alta'|'Media'|'Bassa'} priority
 * @property {string} notes
 */
```

### Supplier

```js
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
```

### Order

```js
/**
 * @typedef {Object} Order
 * @property {string} id                 // es. 'ORD-123'
 * @property {string} supplierName
 * @property {string} orderDate          // 'YYYY-MM-DD'
 * @property {string} notes
 * @property {string} createdAt          // ISO
 */
```

### Product

```js
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
```

### ProductLabel

```js
/**
 * @typedef {Object} ProductLabel
 * @property {string} id
 * @property {string} productId
 * @property {string} labelGroupId
 * @property {string} qrCode              // opzionale
 * @property {string} createdAt
 * @property {string} expiresAt           // se applicabile
 * @property {boolean} archived
 */
```

### LabelGroup

```js
/**
 * @typedef {Object} LabelGroup
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} createdAt
 * @property {boolean} autoCleanup        // pulizia automatica etichette scadute
 */
```

### Notification

```js
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
```

### ActionLog

```js
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
```

### OnboardingState

```js
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
```

## Regole HACCP — Operativo

Range (estratto, vedi utils/temperatureDatabase.js):

fresh_meat: 0..4°C

fresh_fish: 0..2°C

fresh_dairy: 2..4°C

fresh_vegetables: 2..8°C

frozen: −18..−15°C

cooked_hold: 60..65°C

Tolleranza: configurabile (es. ±2°C) in haccpRules.
Compatibilità: evitare categorie incompatibili nello stesso punto.
Status: ok|warning|danger calcolato su (value vs range ± tolleranza).

Rif: [§ Regole HACCP]

## Onboarding & Validazioni

Wizard step-by-step (components/onboarding-steps/):
BusinessInfo → Departments → Conservation → Staff → Tasks → Inventory
Gating: useHaccpValidation + haccpRules; stato per sezione: "confermato/non confermato".

Rif: [§ Onboarding]

## Flusso di Persistenza

UI (componenti feature)
→ DataService (read/write, validazioni, migrazioni, audit)
→ LocalStorage (haccp-*).

Sync (simulato) via SyncManager → supabaseService (placeholder; gating companyId).
Backup/Export via BackupPanel: haccp-backup-YYYY-MM-DD.json.

Rif: [§ Persistenza]

## Notifiche & De-dup

Generazione alert per:

temperature fuori range

scadenze (inventario/etichette)

pulizie non eseguite

De-dup: chiave (type + dataId).

Rif: [§ Notifiche]

## Access Control

Hook useCan valuta capacità per:

ruolo: admin | responsabile | dipendente | collaboratore

reparto

ownership

Azioni critiche (delete/export/sync) → permessi elevati.

## PWA — Note pratiche

public/sw.js per cache offline.

Prompt installazione PWA personalizzato.

In dev, main.jsx deregistra SW preesistenti per evitare cache sporca.

## Esempi pronti

### TemperatureRecord

```json
{
  "id": 1735712345678,
  "date": "12/09/2025",
  "timestamp": 1735712345678,
  "refrigerator": "Frigo A",
  "location": "Cucina / Frigo A",
  "type": "frigo",
  "value": 3.8,
  "unit": "°C",
  "operator": "Mario Rossi",
  "notes": "",
  "status": "ok"
}
```

### CleaningTask

```json
{
  "id": "task-001",
  "task": "Sanificare piani lavoro",
  "assignee": "Cucina",
  "frequency": "settimanale",
  "date": "15/09/2025",
  "completed": false,
  "completedAt": null,
  "completedBy": null,
  "priority": "Alta",
  "notes": ""
}
```

Come usare gli esempi: incollali al bot con una richiesta tipo
"Verifica/adegua questo JSON allo schema [§ Entità › …] e correggi solo il minimo."

## Glossario veloce

Schema: forma di un oggetto (campi, tipi). Serve al bot per generare/verificare JSON.

DataService: unico punto per leggere/scrivere LocalStorage (con validazioni).

De-dup: evita notifiche duplicate usando (type + dataId).

RAG: tecnica per far leggere al bot solo pezzi rilevanti della KB.

## Changelog

1.2 (2025-09-12): pulizia markdown (code fences, riferimenti, formattazione).

1.1 (2025-09-08): completati schemi; aggiunte sezioni HACCP/flow/notifiche.

1.0 (2025-09-08): prima versione unificata.

---

## Cosa fare adesso (3 passi semplici)
1) **Crea la cartella** `docs/knowledge-base/` nella repo.  
2) **Salva** il file qui: `docs/knowledge-base/KB_SINGLE_FILE.md` (copiando il blocco sopra).  
3) Nel tuo bot (DeepSeek/Cursor), **imposta il System Prompt** per usare questo file come **base di verità** (o allegalo).

Se vuoi, dopo lo facciamo anche “alla Cursor”: ti passo un prompt che crea/aggiorna il file automaticamente.
::contentReference[oaicite:0]{index=0}