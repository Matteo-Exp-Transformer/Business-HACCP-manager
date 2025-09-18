/**
 * Router Configuration - HACCP Business Manager
 * 
 * React Router setup with role-based route protection
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth'
import AppLayout from '../components/layouts/AppLayout'

// Lazy load components for better performance
import { lazy, Suspense } from 'react'
import { LoadingState } from '../components/layouts/PageLayout'

// Lazy loaded page components
const Dashboard = lazy(() => import('../components/Dashboard'))
const PuntidiConservazione = lazy(() => import('../components/PuntidiConservazione'))
const Cleaning = lazy(() => import('../components/Cleaning'))
const Inventory = lazy(() => import('../components/Inventory'))
const Management = lazy(() => import('../components/Management'))
const AIAssistant = lazy(() => import('../components/AIAssistant'))
const DataSettings = lazy(() => import('../components/DataSettings'))
const OnboardingWizard = lazy(() => import('../components/OnboardingWizard'))

// Error boundary for route errors
const RouteErrorBoundary = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-error-600 mb-4">
        Errore di Navigazione
      </h1>
      <p className="text-neutral-600 mb-4">
        Si è verificato un errore durante il caricamento della pagina.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        Ricarica Pagina
      </button>
    </div>
  </div>
)

// Loading wrapper for lazy components
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingState title="Caricamento sezione..." />}>
    {children}
  </Suspense>
)

// Import the layout component
import AppLayout from '../components/layouts/AppLayout'

// Create router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // Default redirect to dashboard
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      
      // Dashboard - accessible to all authenticated users
      {
        path: 'dashboard',
        element: (
          <LazyWrapper>
            <Dashboard />
          </LazyWrapper>
        )
      },
      
      // Conservation points - accessible to all users
      {
        path: 'conservation',
        element: (
          <LazyWrapper>
            <PuntidiConservazione />
          </LazyWrapper>
        )
      },
      
      // Tasks and activities - accessible to all users
      {
        path: 'tasks',
        element: (
          <LazyWrapper>
            <Cleaning />
          </LazyWrapper>
        )
      },
      
      // Inventory - accessible to all users
      {
        path: 'inventory',
        element: (
          <LazyWrapper>
            <Inventory />
          </LazyWrapper>
        )
      },
      
      // Settings - accessible to all users
      {
        path: 'settings',
        element: (
          <LazyWrapper>
            <DataSettings />
          </LazyWrapper>
        )
      },
      
      // Management - admin only
      {
        path: 'management',
        element: (
          <ProtectedRoute adminOnly>
            <LazyWrapper>
              <Management />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      
      // AI Assistant - admin only
      {
        path: 'ai-assistant',
        element: (
          <ProtectedRoute adminOnly>
            <LazyWrapper>
              <AIAssistant />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      
      // Onboarding wizard - accessible to all users
      {
        path: 'onboarding',
        element: (
          <LazyWrapper>
            <OnboardingWizard />
          </LazyWrapper>
        )
      }
    ]
  },
  
  // Catch-all route for 404 errors
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">404</h1>
          <p className="text-neutral-600 mb-6">Pagina non trovata</p>
          <a 
            href="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Torna alla Home
          </a>
        </div>
      </div>
    )
  }
])

// Navigation utilities
export const navigationUtils = {
  // Get current route info
  getCurrentRoute: () => {
    const path = window.location.pathname
    return path.substring(1) || 'dashboard'
  },

  // Navigate programmatically
  navigateTo: (path) => {
    window.history.pushState(null, '', `/${path}`)
  },

  // Check if route is active
  isActiveRoute: (routePath) => {
    const currentPath = navigationUtils.getCurrentRoute()
    return currentPath === routePath
  },

  // Get route title for page headers
  getRouteTitle: (routePath) => {
    const titles = {
      dashboard: 'Dashboard',
      conservation: 'Punti di Conservazione',
      tasks: 'Attività e Mansioni',
      inventory: 'Inventario',
      settings: 'Impostazioni e Dati',
      management: 'Gestione',
      'ai-assistant': 'IA Assistant',
      onboarding: 'Configurazione Iniziale'
    }
    return titles[routePath] || 'HACCP Manager'
  }
}

export default router