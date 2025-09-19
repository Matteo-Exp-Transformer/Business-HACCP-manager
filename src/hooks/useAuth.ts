import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/clerk-react'
import { HACCPRole, HACCPPermission, hasPermission, HACCPUserMetadata } from '../lib/clerk'
import { useCallback, useMemo } from 'react'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  fullName?: string
  imageUrl?: string
  role: HACCPRole
  metadata: HACCPUserMetadata
}

export interface AuthState {
  isLoaded: boolean
  isSignedIn: boolean
  user: AuthUser | null
  isLoading: boolean
}

export interface AuthActions {
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<HACCPUserMetadata>) => Promise<void>
  hasPermission: (permission: HACCPPermission) => boolean
  hasRole: (role: HACCPRole) => boolean
  hasAnyRole: (roles: HACCPRole[]) => boolean
}

export const useAuth = (): AuthState & AuthActions => {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()
  const clerk = useClerk()

  // 🔍 DEBUG: Clerk hook state
  console.log('🔍 [useAuth DEBUG] Clerk state:', {
    isLoaded,
    isSignedIn,
    hasClerkUser: !!clerkUser,
    clerkUserId: clerkUser?.id || 'NULL',
    hasClerk: !!clerk
  })

  // Transform Clerk user to our AuthUser format
  const user = useMemo((): AuthUser | null => {
    if (!clerkUser) return null

    const metadata = clerkUser.publicMetadata as HACCPUserMetadata
    
    return {
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      fullName: clerkUser.fullName || undefined,
      imageUrl: clerkUser.imageUrl,
      role: metadata?.role || 'employee',
      metadata: {
        role: metadata?.role || 'employee',
        department: metadata?.department,
        haccpCertification: metadata?.haccpCertification,
        lastLogin: metadata?.lastLogin,
        preferences: metadata?.preferences || {
          language: 'it',
          notifications: true,
          theme: 'light',
        },
      },
    }
  }, [clerkUser])

  // Authentication actions
  const signIn = useCallback(async () => {
    await clerk.openSignIn()
  }, [clerk])

  const signUp = useCallback(async () => {
    await clerk.openSignUp()
  }, [clerk])

  const signOut = useCallback(async () => {
    await clerkSignOut()
  }, [clerkSignOut])

  const updateProfile = useCallback(async (data: Partial<HACCPUserMetadata>) => {
    if (!clerkUser) throw new Error('User not authenticated')

    const currentMetadata = clerkUser.publicMetadata as HACCPUserMetadata
    const updatedMetadata: HACCPUserMetadata = {
      ...currentMetadata,
      ...data,
      lastLogin: new Date().toISOString(),
    }

    await clerkUser.update({
      publicMetadata: updatedMetadata,
    })
  }, [clerkUser])

  // Permission checks
  const checkPermission = useCallback((permission: HACCPPermission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }, [user])

  const checkRole = useCallback((role: HACCPRole): boolean => {
    if (!user) return false
    return user.role === role
  }, [user])

  const checkAnyRole = useCallback((roles: HACCPRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return {
    // State
    isLoaded,
    isSignedIn: isSignedIn ?? false,
    user,
    isLoading: !isLoaded,

    // Actions
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission: checkPermission,
    hasRole: checkRole,
    hasAnyRole: checkAnyRole,
  }
}

// Convenience hooks for common checks
export const useIsAdmin = (): boolean => {
  const { hasRole } = useAuth()
  return hasRole('admin')
}

export const useIsManager = (): boolean => {
  const { hasAnyRole } = useAuth()
  return hasAnyRole(['admin', 'manager'])
}

export const useCanManageUsers = (): boolean => {
  const { hasPermission } = useAuth()
  return hasPermission('manage_users')
}

export const useCanExportData = (): boolean => {
  const { hasPermission } = useAuth()
  return hasPermission('export_data')
}

export const useCanViewAuditTrail = (): boolean => {
  const { hasPermission } = useAuth()
  return hasPermission('view_audit_trail')
}