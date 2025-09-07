# ⚙️ CURSOR SETTINGS - Impostazioni Predefinite

## 🚨 REGOLA FONDAMENTALE: AUTORIZZAZIONE BRANCH

**PRIMA di creare qualsiasi nuovo branch, DEVI SEMPRE chiedere autorizzazione all'utente.**

### 📋 Workflow Standardizzato:

1. **Modifiche su Branch Esistenti**: 
   - ✅ Usa sempre branch esistenti (`main`, `main-precompilato`, etc.)
   - ✅ NON creare nuovi branch senza autorizzazione

2. **Creazione Nuovo Branch**:
   - ❌ **MAI** creare branch automaticamente
   - ✅ **SEMPRE** chiedere: "Vuoi che crei un nuovo branch per questa modifica?"
   - ✅ Aspettare conferma esplicita dell'utente

3. **Quando Chiedere Autorizzazione**:
   - Nuove feature significative
   - Fix complessi che potrebbero rompere il codice
   - Refactoring importante
   - Qualsiasi modifica che richiede isolamento

### 🤔 Domande da Fare Prima di Creare Branch:

```
"🔍 ANALISI RICHIESTA:

La modifica richiesta: [DESCRIZIONE]

Opzioni disponibili:
1. Modificare branch esistente: [NOME_BRANCH]
2. Creare nuovo branch: [NOME_PROPOSTO]

Quale preferisci? 
- Se nuovo branch, conferma il nome
- Se branch esistente, procedo direttamente"
```

### ✅ Esempi di Quando NON Creare Branch:

- Fix minori su bug
- Aggiustamenti di testo
- Piccole modifiche CSS
- Aggiornamenti di configurazione
- Modifiche su file di documentazione

### 🚨 Esempi di Quando Chiedere Autorizzazione:

- Nuove funzionalità complete
- Refactoring di componenti principali
- Modifiche all'architettura
- Integrazione di nuove librerie
- Cambiamenti al sistema di autenticazione

### 📝 Template di Richiesta Autorizzazione:

```
🔍 RICHIESTA AUTORIZZAZIONE BRANCH

📋 Modifica richiesta: [DESCRIZIONE_DETTAGLIATA]

🎯 Impatto stimato: [ALTO/MEDIO/BASSO]

💡 Proposta:
- Branch esistente: [NOME] - [PRO/CONTRO]
- Nuovo branch: [NOME_PROPOSTO] - [PRO/CONTRO]

❓ Vuoi che:
1. Modifichi il branch [ESISTENTE]?
2. Crei un nuovo branch [NOME_PROPOSTO]?
3. Altro approccio?

Aspetto la tua decisione prima di procedere.
```

### 🛡️ Regole di Sicurezza:

1. **SEMPRE** chiedere prima di creare branch
2. **MAI** assumere che l'utente voglia un nuovo branch
3. **SEMPRE** spiegare perché un nuovo branch potrebbe essere utile
4. **SEMPRE** offrire alternative con branch esistenti
5. **SEMPRE** aspettare conferma esplicita

### 📚 Branch Esistenti Disponibili:

- `main` - Produzione pulita
- `main-precompilato` - Sviluppo con dati di test
- `main-backup` - Backup del main
- `main-precompilato-backup` - Backup del precompilato
- `gh-pages` - Deploy GitHub Pages

### 🎯 Obiettivo:

**Massimizzare l'efficienza mantenendo il controllo dell'utente sul workflow Git.**

---
**Data creazione**: 2025-01-09
**Versione**: 1.0
**Stato**: ATTIVO - Seguire sempre queste regole
