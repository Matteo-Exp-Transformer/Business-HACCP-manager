/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il FILE DI ENTRATA PRINCIPALE dell'applicazione HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce l'avvio e il service worker dell'app HACCP
 * ⚠️ Coordina l'inizializzazione di tutti i moduli critici
 * 
 * @fileoverview Entry Point HACCP - Sistema Critico di Avvio
 * @requires AGENT_DIRECTIVES.md
 * @critical Sicurezza alimentare - Inizializzazione Sistema
 * @version 1.0
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initSentry, SentryErrorBoundary } from './lib/sentry.ts'
import AuthProvider from './components/auth/AuthProvider.tsx'

// Initialize Sentry for error monitoring
initSentry()

// Service Worker Registration - Solo in produzione
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              if (confirm('Nuova versione disponibile. Ricaricare la pagina?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if (import.meta.env.DEV) {
  console.log('Service Worker disabilitato in modalità sviluppo per evitare errori di fetch');
  
  // Disabilita il Service Worker esistente se presente
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Disabilitando Service Worker esistente:', registration.scope);
        registration.unregister();
      });
    });
  }
}

// Bootstrap app - temporaneamente disabilitato per test
// (function bootstrap() {
//   const legacy = loadLegacyAndCompose();
//   const loaded = loadState();
//   const state = loaded ?? legacy;

//   if (state) {
//     validateReferentialIntegrity(state, ["conservationPoints", "staff", "departments"]);
//     useDataStore.setState(state, true);
//   }
//   useDataStore.subscribe((s) => saveState(s));
// })();

// Renderizza l'app con Sentry Error Boundary e Auth Provider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={({ error }) => (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Errore Applicazione
          </h1>
          <p className="text-gray-600 mb-4">
            Si è verificato un errore imprevisto. Il team tecnico è stato notificato.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Ricarica Pagina
          </button>
        </div>
      </div>
    )}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SentryErrorBoundary>
  </React.StrictMode>,
)