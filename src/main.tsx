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
import { ClerkProvider } from '@clerk/clerk-react'
// import App from './App.jsx'
import AppWithAuth from './AppWithAuth.jsx'
import './index.css'
import { useDataStore } from "./store/dataStore";
import { loadState, loadLegacyAndCompose, saveState } from "./persistence/adapter";
import { validateReferentialIntegrity } from "./validation/integrity/validateReferentialIntegrity";

// Get Clerk publishable key from environment
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error('[Clerk] Missing VITE_CLERK_PUBLISHABLE_KEY in environment variables');
}

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

// Bootstrap app (load/migrate/integrity + subscribe save)
async function bootstrap() {
  try {
    const legacy = loadLegacyAndCompose();
    const loaded = loadState();
    const state = loaded ?? legacy;

    if (state) {
      validateReferentialIntegrity(state, ["conservationPoints", "staff", "departments"]);
      useDataStore.setState(state, true);
    }
    useDataStore.subscribe((s) => saveState(s));
    
    // Assicurati che il store sia inizializzato
    const store = useDataStore.getState();
    if (!store.meta || !store.meta.forms) {
      console.warn('[Bootstrap] Store non inizializzato, forzando inizializzazione...');
      useDataStore.setState({
        ...store,
        meta: {
          schemaVersion: 1,
          devMode: { mirrorOnboardingChanges: false },
          forms: {},
          pending: false,
          error: null
        }
      }, true);
    }
    
    console.log('[Bootstrap] Store inizializzato correttamente');
  } catch (error) {
    console.error('[Bootstrap] Errore durante l\'inizializzazione:', error);
  }
}

// Inizializza e renderizza l'app
bootstrap().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
        <AppWithAuth />
      </ClerkProvider>
    </React.StrictMode>,
  )
}).catch(error => {
  console.error('[Bootstrap] Errore critico durante l\'inizializzazione:', error);
  // Renderizza comunque l'app con un messaggio di errore
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Errore di Inizializzazione</h1>
          <p className="text-gray-600">Impossibile caricare l'applicazione. Ricarica la pagina.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ricarica Pagina
          </button>
        </div>
      </div>
    </React.StrictMode>,
  )
})