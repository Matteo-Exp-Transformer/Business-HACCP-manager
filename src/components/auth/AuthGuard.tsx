import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { HACCPRole, HACCPPermission } from '../../lib/clerk'
import LoadingSpinner from '../ui/LoadingSpinner'
import UnauthorizedMessage from './UnauthorizedMessage'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRoles?: HACCPRole[]
  requiredPermissions?: HACCPPermission[]
  fallback?: React.ReactNode
  loadingComponent?: React.ReactNode
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
  loadingComponent,
}) => {
  const { isLoaded, isSignedIn, user, hasRole, hasPermission } = useAuth()

  // Show loading while authentication state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {loadingComponent || <LoadingSpinner />}
      </div>
    )
  }

  // Check if authentication is required
  if (requireAuth && !isSignedIn) {
    return fallback || <UnauthorizedMessage message="Accesso richiesto" />
  }

  // Check role requirements
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role))
    if (!hasRequiredRole) {
      return fallback || (
        <UnauthorizedMessage 
          message="Ruolo insufficiente"
          description={`Ruoli richiesti: ${requiredRoles.join(', ')}`}
        />
      )
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    if (!hasRequiredPermissions) {
      return fallback || (
        <UnauthorizedMessage 
          message="Permessi insufficienti"
          description="Non hai i permessi necessari per accedere a questa sezione"
        />
      )
    }
  }

  return <>{children}</>
}

export default AuthGuard