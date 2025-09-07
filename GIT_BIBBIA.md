# 🛠️ BIBBIA GIT - Metodo Standardizzato

## 📖 REGOLA D'ORO
**MAI usare "git" direttamente, sempre il percorso completo con --no-pager**

## 🔧 FORMATO STANDARDIZZATO
```powershell
& "C:\Program Files\Git\bin\git.exe" --no-pager <comando>
```

## 📋 COMANDI STANDARDIZZATI

### Status e Informazioni
```powershell
# Status del repository
& "C:\Program Files\Git\bin\git.exe" --no-pager status

# Lista branch
& "C:\Program Files\Git\bin\git.exe" --no-pager branch

# Log semplificato
& "C:\Program Files\Git\bin\git.exe" --no-pager log --oneline

# Informazioni remote
& "C:\Program Files\Git\bin\git.exe" --no-pager remote -v
```

### Navigazione Branch
```powershell
# Cambiare branch
& "C:\Program Files\Git\bin\git.exe" checkout <branch-name>

# Creare nuovo branch
& "C:\Program Files\Git\bin\git.exe" checkout -b <new-branch-name>

# Creare branch da branch esistente
& "C:\Program Files\Git\bin\git.exe" checkout -b <new-branch> <source-branch>
```

### Gestione Modifiche
```powershell
# Aggiungere tutti i file
& "C:\Program Files\Git\bin\git.exe" add .

# Aggiungere file specifico
& "C:\Program Files\Git\bin\git.exe" add <file-path>

# Commit con messaggio
& "C:\Program Files\Git\bin\git.exe" commit -m "messaggio"

# Commit con messaggio multi-riga
& "C:\Program Files\Git\bin\git.exe" commit -m "titolo" -m "descrizione dettagliata"
```

### Sincronizzazione
```powershell
# Push su branch corrente
& "C:\Program Files\Git\bin\git.exe" push origin HEAD

# Push su branch specifico
& "C:\Program Files\Git\bin\git.exe" push origin <branch-name>

# Pull dal branch corrente
& "C:\Program Files\Git\bin\git.exe" pull origin HEAD

# Fetch senza merge
& "C:\Program Files\Git\bin\git.exe" fetch origin
```

### Merge e Rebase
```powershell
# Merge branch
& "C:\Program Files\Git\bin\git.exe" merge <branch-name>

# Merge senza fast-forward
& "C:\Program Files\Git\bin\git.exe" merge --no-ff <branch-name>

# Rebase
& "C:\Program Files\Git\bin\git.exe" rebase <branch-name>
```

### Gestione File
```powershell
# Rimuovere file dal tracking
& "C:\Program Files\Git\bin\git.exe" rm --cached <file-path>

# Ripristinare file
& "C:\Program Files\Git\bin\git.exe" checkout -- <file-path>

# Ripristinare tutto
& "C:\Program Files\Git\bin\git.exe" checkout -- .
```

### Configurazione
```powershell
# Configurare user
& "C:\Program Files\Git\bin\git.exe" config user.name "Nome"
& "C:\Program Files\Git\bin\git.exe" config user.email "email@example.com"

# Configurare editor
& "C:\Program Files\Git\bin\git.exe" config core.editor "notepad"

# Disabilitare pager globalmente
& "C:\Program Files\Git\bin\git.exe" config --global core.pager ""
```

## ⚠️ VANTAGGI DEL METODO STANDARDIZZATO

✅ **Evita problemi con PATH** - Non dipende dalla configurazione del sistema
✅ **Evita pager che si apre** - --no-pager previene l'apertura di less/more
✅ **Evita conflitti con PowerShell** - Il percorso completo funziona sempre
✅ **Evita comandi interrotti** - Comandi più stabili e prevedibili
✅ **Funziona sempre su Windows** - Testato e verificato

## 🚨 ERRORI COMUNI DA EVITARE

❌ **NON fare**: `git status`
❌ **NON fare**: `git branch` (senza --no-pager)
❌ **NON fare**: `git log` (senza --no-pager)
❌ **NON fare**: `git checkout` (senza percorso completo)

✅ **FARE sempre**: `& "C:\Program Files\Git\bin\git.exe" --no-pager status`
✅ **FARE sempre**: `& "C:\Program Files\Git\bin\git.exe" --no-pager branch`
✅ **FARE sempre**: `& "C:\Program Files\Git\bin\git.exe" --no-pager log --oneline`

## 📝 ESEMPI PRATICI

### Workflow Completo
```powershell
# 1. Controllare status
& "C:\Program Files\Git\bin\git.exe" --no-pager status

# 2. Aggiungere modifiche
& "C:\Program Files\Git\bin\git.exe" add .

# 3. Commit
& "C:\Program Files\Git\bin\git.exe" commit -m "Fix: Risolto problema X"

# 4. Push
& "C:\Program Files\Git\bin\git.exe" push origin HEAD
```

### Gestione Branch
```powershell
# 1. Creare nuovo branch
& "C:\Program Files\Git\bin\git.exe" checkout -b feature/nuova-funzionalita

# 2. Lavorare e commit
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" commit -m "Add: Nuova funzionalità"

# 3. Tornare a main
& "C:\Program Files\Git\bin\git.exe" checkout main

# 4. Merge
& "C:\Program Files\Git\bin\git.exe" merge feature/nuova-funzionalita
```

---
**Data creazione**: 2025-01-09
**Versione**: 1.0
**Stato**: ATTIVO - Usare sempre questo metodo
