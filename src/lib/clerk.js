/**
 * Clerk Authentication Configuration
 * 
 * This file configures Clerk authentication for the HACCP Business Manager
 * 
 * Features:
 * - Email/password authentication
 * - Role-based access control (RBAC)
 * - Multi-tenant support
 * - Optional MFA for administrators
 * - JWT token handling
 * - Session management
 */

import { ClerkProvider } from '@clerk/clerk-react'

// Get the publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error("Missing Clerk publishable key. Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file")
}

// Clerk configuration options
export const clerkConfig = {
  publishableKey: clerkPubKey,
  appearance: {
    baseTheme: undefined,
    variables: {
      colorPrimary: '#2563eb', // Blue primary color matching our theme
      colorBackground: '#ffffff',
      colorInputBackground: '#f8fafc',
      colorInputText: '#1e293b',
      borderRadius: '0.5rem',
    },
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
      card: 'shadow-lg border border-gray-200',
      headerTitle: 'text-gray-900 font-semibold',
      headerSubtitle: 'text-gray-600',
    }
  },
  localization: {
    signIn: {
      start: {
        title: 'Accedi al tuo account HACCP',
        subtitle: 'Gestisci la sicurezza alimentare del tuo ristorante',
      }
    },
    signUp: {
      start: {
        title: 'Crea il tuo account HACCP',
        subtitle: 'Inizia a digitalizzare la gestione HACCP',
      }
    }
  }
}

// Role definitions for RBAC
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  EMPLOYEE: 'employee',
  COLLABORATOR: 'collaborator'
}

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'manage_users',
    'manage_departments', 
    'manage_settings',
    'view_all_data',
    'export_data',
    'manage_conservation_points',
    'manage_tasks',
    'manage_inventory',
    'view_reports'
  ],
  [USER_ROLES.MANAGER]: [
    'view_all_data',
    'manage_tasks',
    'manage_inventory',
    'manage_conservation_points',
    'view_reports',
    'assign_tasks'
  ],
  [USER_ROLES.EMPLOYEE]: [
    'view_assigned_tasks',
    'complete_tasks',
    'log_temperatures',
    'manage_assigned_inventory',
    'view_own_data'
  ],
  [USER_ROLES.COLLABORATOR]: [
    'view_assigned_tasks',
    'complete_tasks',
    'log_temperatures',
    'view_own_data'
  ]
}

/**
 * Check if user has specific permission
 * @param {Object} user - Clerk user object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.publicMetadata?.role) return false
  
  const userRole = user.publicMetadata.role
  const permissions = ROLE_PERMISSIONS[userRole] || []
  
  return permissions.includes(permission)
}

/**
 * Get user role from Clerk user object
 * @param {Object} user - Clerk user object
 * @returns {string}
 */
export const getUserRole = (user) => {
  return user?.publicMetadata?.role || USER_ROLES.EMPLOYEE
}

/**
 * Check if user is admin
 * @param {Object} user - Clerk user object
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return getUserRole(user) === USER_ROLES.ADMIN
}

/**
 * Check if user is manager or above
 * @param {Object} user - Clerk user object
 * @returns {boolean}
 */
export const isManagerOrAbove = (user) => {
  const role = getUserRole(user)
  return role === USER_ROLES.ADMIN || role === USER_ROLES.MANAGER
}

/**
 * Get company ID from user metadata
 * @param {Object} user - Clerk user object
 * @returns {string|null}
 */
export const getCompanyId = (user) => {
  return user?.publicMetadata?.companyId || null
}

export default clerkConfig