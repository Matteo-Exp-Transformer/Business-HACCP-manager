/**
 * HACCP Business Manager - Integrated Main Entry Point
 * 
 * Complete application entry point with all integrations:
 * - Clerk authentication
 * - React Router navigation
 * - React Query for server state
 * - PWA functionality
 * - Error boundaries
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Import configurations
import { router } from './lib/router'
import { queryClient } from './lib/react-query'
import clerkConfig from './lib/clerk'

// Import components
import { ToastProvider } from './components/ui/Toast'
import PWAInstallPrompt from './components/PWAInstallPrompt-new'
import UpdateNotification from './components/ui/UpdateNotification'
import OfflineIndicator from './components/ui/OfflineIndicator'

// Import utilities
import { initializeOfflineDB } from './lib/indexedDB'

// Import styles
import './index.css'

// Error boundary component
class ErrorBoundary extends Error.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo)
    
    // In production, send to error monitoring service
    if (import.meta.env.PROD) {
      // TODO: Send to Sentry or other error service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="max-w-md w-full p-6 bg-white rounded-xl shadow-strong">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-error-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 mb-2">
                  Errore dell&apos;Applicazione
                </h1>
                <p className="text-neutral-600 mb-4">
                  Si è verificato un errore imprevisto. Ricarica la pagina per riprovare.
                </p>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Ricarica Applicazione
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Initialize offline database
initializeOfflineDB()

// App wrapper with all providers
const App = () => (
  <ErrorBoundary>
    <ClerkProvider {...clerkConfig}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        
        {/* Global UI Components */}
        <ToastProvider />
        <PWAInstallPrompt />
        <UpdateNotification />
        <OfflineIndicator />
        
        {/* Development tools */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ClerkProvider>
  </ErrorBoundary>
)

// Render the application
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)