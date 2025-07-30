Business Haccp Manager

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

## 📞 Supporto

Per problemi, suggerimenti o contributi:
- **Issues**: [GitHub Issues](https://github.com/Matteo-Exp-Transformer/Business-HACCP-manager/issues)
- **Documentazione**: Vedi cartelle `docs/` per guide dettagliate

## 📄 Licenza

Questo progetto è sviluppato per scopi didattici e professionali. Consultare il proprietario per l'utilizzo commerciale.

---

**Mini-ePackPro** - *Semplifica la gestione HACCP con tecnologia moderna*
