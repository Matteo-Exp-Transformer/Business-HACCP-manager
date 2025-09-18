/**
 * Authentication Feature Exports
 * 
 * Central export point for all authentication-related components and utilities
 */

export { default as AuthProvider } from './AuthProvider'
export { default as AuthButton } from './AuthButton'
export { default as ProtectedRoute } from './ProtectedRoute'
export { default as useAuth } from './useAuth'

// Re-export Clerk hooks for convenience
export { 
  useUser, 
  useAuth as useClerkAuth,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton
} from '@clerk/clerk-react'

// Re-export utilities from clerk config
export {
  USER_ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  getUserRole,
  isAdmin,
  isManagerOrAbove,
  getCompanyId
} from '../../lib/clerk'