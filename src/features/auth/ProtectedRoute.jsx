/**
 * Protected Route Component
 * 
 * Protects routes based on authentication and role permissions
 */

import React from 'react'
import { useUser } from '@clerk/clerk-react'
import { hasPermission, isAdmin } from '../../lib/clerk'
import { AlertTriangle } from 'lucide-react'

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null, 
  adminOnly = false, 
  fallback = null 
}) => {
  const { isSignedIn, user, isLoaded } = useUser()

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // User not signed in
  if (!isSignedIn) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accesso Richiesto
        </h2>
        <p className="text-gray-600 text-center">
          È necessario effettuare l'accesso per visualizzare questa pagina.
        </p>
      </div>
    )
  }

  // Check admin-only access
  if (adminOnly && !isAdmin(user)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accesso Negato
        </h2>
        <p className="text-gray-600 text-center">
          Solo gli amministratori possono accedere a questa sezione.
        </p>
      </div>
    )
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Permesso Insufficiente
        </h2>
        <p className="text-gray-600 text-center">
          Non hai i permessi necessari per accedere a questa sezione.
        </p>
      </div>
    )
  }

  // All checks passed, render children
  return children
}

export default ProtectedRoute