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
import { initializePersistence } from './persistence/adapter'

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

// Inizializza persistenza e migrazioni prima del rendering
const initializeApp = async () => {
  try {
    console.log('🚀 Inizializzazione app HACCP...')
    
    // Inizializza persistenza e migrazioni
    const persistenceReady = await initializePersistence()
    
    if (persistenceReady) {
      console.log('✅ Persistenza inizializzata con successo')
    } else {
      console.warn('⚠️ Problemi nell\'inizializzazione della persistenza')
    }
    
    // Renderizza l'app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    
  } catch (error) {
    console.error('❌ Errore critico nell\'inizializzazione:', error)
    
    // Renderizza comunque l'app in caso di errore
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}

// Avvia l'inizializzazione
initializeApp()