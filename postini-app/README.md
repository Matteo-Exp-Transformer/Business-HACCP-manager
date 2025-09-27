# Postini App 📮

App mobile per la gestione ottimizzata dei percorsi postali, sviluppata in React Native con Expo.

## 🚀 Funzionalità Principali

- **Login locale** con gestione ruoli (utente/admin)
- **Mappa in tempo reale** con GPS tracking
- **Gestione indirizzi** con inserimento manuale e note
- **Ricerca intelligente** con ottimizzazione percorsi
- **Statistiche** di consegna (tempo, distanza, fermate)
- **Modalità offline** con cache locale
- **Design moderno** ispirato allo stile Apple

## 🛠️ Setup e Installazione

### Prerequisiti
- Node.js (v16 o superiore)
- npm o yarn
- Expo CLI
- Android Studio (per test Android)

### Installazione
```bash
cd postini-app
npm install
npm start
```

### Test su Android
```bash
npm run android
```

## 📱 Struttura dell'App

### Schermate
- **Login**: Accesso con username (admin/postino)
- **Home**: Selezione percorso e azioni rapide
- **Mappa**: Visualizzazione fullscreen con GPS live
- **Indirizzi**: Gestione lista indirizzi per percorso
- **Ricerca**: Ricerca intelligente e ottimizzazione
- **Statistiche**: Tracking tempo, distanza, fermate

### Servizi
- **Database**: SQLite per storage locale
- **Location**: GPS tracking e calcoli distanza
- **Auth**: Autenticazione locale con ruoli

## 🎨 Design System

### Colori
- **Primario**: #FFD800 (Giallo Poste.it)
- **Secondario**: #2C3E50 (Blu scuro)
- **Sfondo**: #FFFFFF
- **Superficie**: #F8F9FA

### Stile
- Bottoni arrotondati con effetti hover
- Animazioni fluide con Framer Motion
- Design minimal ispirato ad Apple
- Trasparenze e ombre per profondità

## 📊 Funzionalità Avanzate

### GPS e Posizionamento
- Tracking in tempo reale
- Evidenziazione indirizzi vicini (500m)
- Calcolo percorsi ottimali

### Storage Offline
- Cache locale completa
- Sincronizzazione differita
- Funzionamento senza connessione

### Statistiche
- Tempo di percorrenza
- Distanza percorsa
- Numero di fermate
- Percentuale completamento

## 🔧 Tecnologie Utilizzate

- **React Native + Expo**: Framework mobile
- **React Native Maps**: Integrazione mappe
- **SQLite**: Database locale
- **AsyncStorage**: Persistenza configurazioni
- **Expo Location**: Servizi GPS
- **React Navigation**: Navigazione tra schermate
- **React Native Paper**: Componenti UI

## 📄 Credenziali di Test

- **Admin**: username `admin`
- **Postino**: username `postino`

## 🚧 Sviluppi Futuri

- Server centrale per sincronizzazione
- Notifiche push
- Multi-utente con aggiornamenti real-time
- Integrazione API esterne (Google Maps, geocoding)
- Export statistiche
- Backup cloud

## 📝 Note di Sviluppo

L'app è stata progettata seguendo il PRD specificato, con focus su:
- Usabilità per postini sul campo
- Performance in modalità offline
- Design intuitivo e moderno
- Scalabilità per future integrazioni server