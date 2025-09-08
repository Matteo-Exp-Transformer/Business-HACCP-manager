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
