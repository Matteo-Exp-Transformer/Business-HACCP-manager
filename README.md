# Mini-ePackPro - Sistema HACCP

[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5.14-purple.svg)](https://vitejs.dev/)

Sistema digitale completo per la gestione HACCP nei ristoranti e attività alimentari. Progressive Web App (PWA) con funzionalità offline-first.

## 🚀 Funzionalità Principali

### ✅ Moduli Implementati
- **🌡️ Gestione Temperature**: Registrazione e monitoraggio temperature con validazione automatica
- **🧹 Attività di Pulizia**: Pianificazione e tracciamento delle attività di sanificazione
- **👥 Gestione Personale**: Anagrafica del team con certificazioni HACCP
- **📊 Dashboard**: Panoramica generale con statistiche e alert

### 🔧 Funzionalità Tecniche
- **📱 Progressive Web App**: Installabile su dispositivi mobili
- **🔄 Offline-First**: Funziona senza connessione internet
- **💾 localStorage**: Persistenza dati locale
- **📄 Export PDF**: Generazione report temperature
- **📥 Import/Export**: Backup e ripristino dati in formato JSON
- **🎨 UI Responsive**: Ottimizzata per mobile e desktop

## 🛠️ Stack Tecnologico

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 4.5.14
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **PWA**: Service Worker + Web App Manifest

## 📦 Installazione e Avvio

```bash
# Clona il repository
git clone https://github.com/Matteo-Exp-Transformer/Business-HACCP-manager.git
cd Business-HACCP-manager

# Installa le dipendenze
npm install

# Avvia in modalità sviluppo
npm run dev

# Compila per produzione
npm run build

# Anteprima build di produzione
npm run preview
```

## 🌐 Struttura del Progetto

```
├── src/
│   ├── components/
│   │   ├── ui/           # Componenti UI base
│   │   ├── Dashboard.jsx # Dashboard con statistiche
│   │   ├── Temperature.jsx # Gestione temperature
│   │   ├── Cleaning.jsx  # Attività pulizie
│   │   ├── Staff.jsx     # Gestione personale
│   │   └── PDFExport.jsx # Export PDF temperature
│   ├── App.jsx           # Componente principale
│   ├── main.jsx          # Entry point
│   └── index.css         # Stili globali
├── docs/                 # Build per GitHub Pages
├── public/               # Asset statici
└── package.json
```

## 📊 Gestione Dati

### Formato Temperature
```javascript
{
  id: timestamp,
  location: "Frigorifero principale",
  temperature: 2.5,
  time: "29/07/2025, 10:30:15",
  status: "ok" | "warning" | "danger"
}
```

### Validazione Temperature
- **Sicura** (Verde): < 4°C
- **Attenzione** (Giallo): 4°C - 8°C  
- **Pericolosa** (Rosso): > 8°C

### Formato Attività Pulizie
```javascript
{
  id: timestamp,
  task: "Pulizia frigorifero",
  assignee: "Mario Rossi",
  completed: false,
  date: "29/07/2025",
  createdAt: "29/07/2025, 10:30:15"
}
```

### Formato Personale
```javascript
{
  id: timestamp,
  name: "Mario Rossi",
  role: "Cuoco",
  certification: "Certificato HACCP livello 2",
  addedDate: "29/07/2025",
  addedTime: "29/07/2025, 10:30:15"
}
```

## 📱 Funzionalità PWA

- **Installazione**: Pulsante "Aggiungi alla home screen"
- **Offline**: Funziona senza connessione internet
- **Cache**: Service Worker con strategie di caching intelligenti
- **Notifiche**: Predisposto per notifiche push (future)
- **Sincronizzazione**: Background sync quando torna online

## 📄 Export/Import

### Export JSON
Esporta tutti i dati in formato JSON strutturato:
```javascript
{
  temperatures: [...],
  cleaningTasks: [...], 
  staff: [...],
  exportDate: "2025-07-29T10:30:15.000Z"
}
```

### Export PDF Temperature
- Header con data e totale rilevazioni
- Tabella con posizione, temperatura e orario
- Footer con numerazione pagine
- Stili personalizzati per stampa

## 🔧 Configurazione

### Ambiente Sviluppo
```bash
# Porta di sviluppo
VITE_PORT=3000

# Hot reload attivo
VITE_HOST=localhost
```

### Build Produzione
```bash
# Output directory
BUILD_DIR=docs

# Base path per GitHub Pages
BASE_PATH=./
```

## 📋 Prossimi Sviluppi

### Moduli Pianificati
- **📦 Ricevimento Merci**: Controllo fornitori e temperature arrivo
- **🥜 Gestione Allergeni**: Mappatura allergeni per piatto
- **🔍 Tracciabilità**: Lotti prodotti e scadenze
- **🔧 Manutenzione**: Calendario manutenzioni e interventi
- **⚠️ Non Conformità**: Registro problemi e azioni correttive
- **🎓 Formazione**: Registro corsi e scadenze attestati

### Miglioramenti Tecnici
- [ ] Autenticazione utenti
- [ ] Backend API per sync multi-device
- [ ] Notifiche push per scadenze
- [ ] Dark mode
- [ ] Filtri avanzati e ricerca
- [ ] Reportistica automatica
- [ ] Integrazione firma digitale

## 📞 Supporto

Per problemi, suggerimenti o contributi:
- **Issues**: [GitHub Issues](https://github.com/Matteo-Exp-Transformer/Business-HACCP-manager/issues)
- **Documentazione**: Vedi cartelle `docs/` per guide dettagliate

## 📄 Licenza

Questo progetto è sviluppato per scopi didattici e professionali. Consultare il proprietario per l'utilizzo commerciale.

---

**Mini-ePackPro** - *Semplifica la gestione HACCP con tecnologia moderna*
