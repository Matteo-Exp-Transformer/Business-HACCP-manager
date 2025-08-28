# 📋 GUIDA DOCUMENTAZIONE LAVORI

**PER IA ASSISTANTI E SVILUPPATORI**

Questa cartella contiene la documentazione di tutti i lavori svolti sul codice. 
Segui queste linee guida per mantenere una documentazione organizzata e facilmente gestibile.

---

## 🎯 **REGOLE PRINCIPALI**

### 1. **STRUTTURA OBBLIGATORIA**
Ogni lavoro deve essere documentato nella cartella appropriata:

```
jobs/
├── normal/           # Lavori normali (bugfix, feature, refactor)
│   └── [nome-lavoro]/
│       ├── README.md        # Descrizione del lavoro
│       ├── CHANGELOG.md     # Modifiche effettuate
│       └── [altri file]     # Report, log, etc.
└── night/            # Night Job (lavori intensivi notturni)
    └── [nome-night-job]/
        ├── NIGHT_RUN_LOG.md # Log dettagliato esecuzione
        ├── REPORT.md        # Report finale
        └── [altri file]     # Template, modelli, etc.
```

### 2. **NOMENCLATURA CARTELLE**
- **Lavori normali**: `normal/[tipo]-[descrizione-breve]`
  - Esempio: `normal/bugfix-login-error`, `normal/feature-user-profile`
- **Night Job**: `night/[tipo]-[YYYY-MM-DD]`
  - Esempio: `night/haccp-2025-12-08`, `night/refactor-2025-12-15`

### 3. **FILE OBBLIGATORI**
Ogni cartella lavoro deve contenere:
- `README.md` - Descrizione generale del lavoro
- `CHANGELOG.md` o `NIGHT_RUN_LOG.md` - Dettaglio modifiche
- Altri file specifici (report, template, etc.)

---

## 📝 **TEMPLATE PER LAVORI NORMALI**

### README.md
```markdown
# [TIPO LAVORO] - [DESCRIZIONE]

**Data:** [GG/MM/AAAA]  
**Tipo:** [bugfix/feature/refactor/ottimizzazione]  
**Priorità:** [A/M/B]  
**Stato:** [COMPLETATO/IN CORSO/PAUSA]  

## 📋 Descrizione
Breve descrizione del lavoro svolto

## 🔧 Modifiche Effettuate
- [ ] Modifica 1
- [ ] Modifica 2

## 📁 File Modificati
- `src/...` - Descrizione modifica

## ✅ Test
- [ ] Test 1 completato
- [ ] Test 2 completato

## 🎯 Risultato
Descrizione del risultato ottenuto
```

### CHANGELOG.md
```markdown
# Changelog - [NOME LAVORO]

## [GG/MM/AAAA] - Completamento
### Aggiunto
- Nuova funzionalità 1
- Nuova funzionalità 2

### Modificato
- Modifica esistente 1
- Modifica esistente 2

### Rimosso
- Funzionalità deprecata 1

### Risolto
- Bug 1
- Bug 2
```

---

## 🌙 **TEMPLATE PER NIGHT JOB**

### README.md
```markdown
# NIGHT JOB - [TIPO] [DATA]

**Data Inizio:** [GG/MM/AAAA HH:MM]  
**Data Fine:** [GG/MM/AAAA HH:MM]  
**Branch:** [nome-branch]  
**Obiettivo:** [descrizione obiettivo principale]  

## 📋 Priorità di Lavoro
### P1 – [Priorità Alta]
- [ ] Task 1
- [ ] Task 2

### P2 – [Priorità Media]
- [ ] Task 3
- [ ] Task 4

## 🔄 Flusso Operativo
### Fase 1: [Setup/Analisi]
- [ ] Task setup 1
- [ ] Task setup 2

### Fase 2: [Implementazione]
- [ ] Task implementazione 1
- [ ] Task implementazione 2

### Fase 3: [Test/Report]
- [ ] Test finale
- [ ] Generazione report
```

### NIGHT_RUN_LOG.md
```markdown
# NIGHT RUN LOG - [NOME NIGHT JOB]

**Data Inizio:** [GG/MM/AAAA HH:MM]  
**Branch:** [nome-branch]  
**Obiettivo:** [descrizione obiettivo]  

## 📝 Log Attività

### [HH:MM] - [Fase/Task]
- ✅ Task completato 1
- ✅ Task completato 2
- ⚠️ Attenzione/Problema risolto

### [HH:MM] - [Fase/Task]
- ✅ Task completato 3
- ❌ Problema identificato e risolto

## 🎯 Metriche di Successo
- [x] App si avvia senza errori
- [x] Test completati con successo
- [x] Nessun bug strutturale introdotto

## ⚠️ Invarianti da Rispettare
- Stile "Manus", responsive 360×640, dark mode
- Nessuna nuova dipendenza
- Struttura progetto invariata
```

---

## 🚀 **PROCEDURA PER NUOVI LAVORI**

### 1. **Creazione Struttura**
```bash
# Per lavoro normale
mkdir -p docs/jobs/normal/[nome-lavoro]

# Per Night Job
mkdir -p docs/jobs/night/[nome-night-job]
```

### 2. **Creazione File Base**
- Crea `README.md` con template appropriato
- Crea `CHANGELOG.md` o `NIGHT_RUN_LOG.md`
- Aggiungi altri file specifici se necessario

### 3. **Aggiornamento Durante Lavoro**
- Aggiorna i file di log in tempo reale
- Segna i task completati con ✅
- Documenta problemi e soluzioni

### 4. **Completamento Lavoro**
- Aggiorna stato a "COMPLETATO"
- Completa tutte le sezioni
- Verifica che tutti i file siano aggiornati

---

## 🧹 **GESTIONE E PULIZIA**

### Rimozione Lavori Completati
```bash
# Rimuovere lavoro specifico
rm -rf docs/jobs/normal/[nome-lavoro]
rm -rf docs/jobs/night/[nome-night-job]

# Rimuovere tutti i lavori
rm -rf docs/jobs/

# Rimuovere solo lavori normali
rm -rf docs/jobs/normal/

# Rimuovere solo Night Job
rm -rf docs/jobs/night/
```

### Archiviazione
Per lavori importanti, considera di:
- Creare backup prima della rimozione
- Mantenere copie in cartelle separate
- Documentare i lavori completati in un archivio

---

## ⚠️ **IMPORTANTE**

- **MANTIENI SEMPRE** la struttura delle cartelle
- **AGGIORNA IN TEMPO REALE** i log durante il lavoro
- **DOCUMENTA TUTTO** quello che fai
- **SEGUI I TEMPLATE** per consistenza
- **VERIFICA** che la documentazione sia completa prima di completare

---

*Ultimo aggiornamento: 08/12/2025*
*Generato da: Night Job HACCP*
