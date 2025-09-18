/**
 * Custom Authentication Hook
 * 
 * Provides authentication utilities and user information
 */

import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react'
import { getUserRole, hasPermission, isAdmin, isManagerOrAbove, getCompanyId } from '../../lib/clerk'

export const useAuth = () => {
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut, getToken } = useClerkAuth()

  const userRole = user ? getUserRole(user) : null
  const companyId = user ? getCompanyId(user) : null

  return {
    // Authentication state
    isSignedIn,
    isLoaded,
    user,
    
    // User information
    userRole,
    companyId,
    userName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress || '',
    userEmail: user?.emailAddresses?.[0]?.emailAddress || '',
    
    // Role checks
    isAdmin: user ? isAdmin(user) : false,
    isManagerOrAbove: user ? isManagerOrAbove(user) : false,
    
    // Permission checks
    hasPermission: (permission) => user ? hasPermission(user, permission) : false,
    
    // Authentication actions
    signOut,
    getToken,
    
    // Utility functions
    canManageUsers: () => user ? hasPermission(user, 'manage_users') : false,
    canManageDepartments: () => user ? hasPermission(user, 'manage_departments') : false,
    canManageSettings: () => user ? hasPermission(user, 'manage_settings') : false,
    canViewAllData: () => user ? hasPermission(user, 'view_all_data') : false,
    canExportData: () => user ? hasPermission(user, 'export_data') : false,
    canManageConservationPoints: () => user ? hasPermission(user, 'manage_conservation_points') : false,
    canManageTasks: () => user ? hasPermission(user, 'manage_tasks') : false,
    canManageInventory: () => user ? hasPermission(user, 'manage_inventory') : false,
    canViewReports: () => user ? hasPermission(user, 'view_reports') : false,
  }
}

export default useAuth