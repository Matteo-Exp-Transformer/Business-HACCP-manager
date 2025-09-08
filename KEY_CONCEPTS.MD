# Concetti Fondamentali del Progetto HACCP

## Entità Principali

### User (Utente)
```javascript
{
  id: string,           // ID univoco utente
  name: string,         // Nome utente
  pin: string,          // PIN di accesso
  role: 'admin' | 'dipendente' | 'responsabile' | 'collaboratore',
  department: string,   // Reparto di appartenenza
  createdAt: string,    // Data creazione (ISO)
  isActive: boolean     // Stato attivo
}
```

### Department (Reparto)
```javascript
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
```

### Conservation Point (Punto di Conservazione)
```javascript
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
```

### Product (Prodotto)
```javascript
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
```

### Temperature Record (Registrazione Temperatura)
```javascript
{
  id: string,           // ID univoco
  refrigeratorId: string, // ID frigorifero
  temperature: number,   // Temperatura rilevata
  timestamp: string,     // Data/ora rilevamento
  status: 'ok' | 'warning' | 'danger', // Stato temperatura
  recordedBy: string,    // Operatore che ha rilevato
  notes: string         // Note aggiuntive
}
```

### Cleaning Task (Attività di Pulizia)
```javascript
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
```

### Staff Member (Membro Staff)
```javascript
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
```

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
```javascript
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
```

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

