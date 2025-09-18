/**
 * HACCP Business Manager - Main Entry Point
 * 
 * This is the main entry point for the HACCP Business Manager application
 * with Clerk authentication integration.
 * 
 * Features:
 * - Clerk authentication provider
 * - Service Worker registration for PWA
 * - React StrictMode for development
 * - Error boundary for production stability
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'
import clerkConfig from './lib/clerk.js'

// Service Worker Registration - Only in production
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
  console.log('Service Worker disabled in development mode');
  
  // Disable existing Service Worker if present
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        console.log('Unregistering existing Service Worker:', registration.scope);
        registration.unregister();
      });
    });
  }
}

// Error boundary component for production stability
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (import.meta.env.PROD) {
      // TODO: Send to error reporting service (e.g., Sentry)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Errore dell'Applicazione
              </h1>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore imprevisto. Ricarica la pagina per riprovare.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Ricarica Pagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render the application with Clerk authentication
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ClerkProvider {...clerkConfig}>
        <App />
      </ClerkProvider>
    </ErrorBoundary>
  </React.StrictMode>
)