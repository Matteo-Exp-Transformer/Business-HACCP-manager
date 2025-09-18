import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useMemo } from 'react';

/**
 * Custom hook for authentication context
 * Wraps Clerk's auth hooks and adds business logic
 */
export function useAuthContext() {
  const { isLoaded, isSignedIn, userId, sessionId, signOut } = useClerkAuth();
  const { user, isLoaded: isUserLoaded } = useUser();

  // Extract user role from public metadata
  const userRole = user?.publicMetadata?.role || 'employee';
  
  // Extract company ID from public metadata
  const companyId = user?.publicMetadata?.companyId || null;

  // Check if user has completed onboarding
  const hasCompletedOnboarding = user?.publicMetadata?.onboardingCompleted || false;

  // Role checking functions
  const isAdmin = userRole === 'admin';
  const isManager = userRole === 'manager' || isAdmin;
  const isEmployee = userRole === 'employee';
  const isCollaborator = userRole === 'collaborator';

  // Permission checking function
  const hasPermission = (permission) => {
    const permissions = {
      // Admin permissions
      'manage_users': ['admin'],
      'manage_company': ['admin'],
      'view_all_reports': ['admin', 'manager'],
      'export_data': ['admin', 'manager'],
      
      // Manager permissions
      'assign_tasks': ['admin', 'manager'],
      'view_team_stats': ['admin', 'manager'],
      'manage_departments': ['admin', 'manager'],
      
      // Employee permissions
      'complete_tasks': ['admin', 'manager', 'employee'],
      'log_temperatures': ['admin', 'manager', 'employee'],
      'view_own_tasks': ['admin', 'manager', 'employee'],
      
      // Collaborator permissions
      'view_limited_data': ['admin', 'manager', 'employee', 'collaborator'],
    };

    return permissions[permission]?.includes(userRole) || false;
  };

  // Memoize the auth context object
  const authContext = useMemo(() => ({
    // Loading states
    isLoaded: isLoaded && isUserLoaded,
    isSignedIn,
    
    // User info
    userId,
    sessionId,
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
      role: userRole,
      companyId,
      hasCompletedOnboarding,
    } : null,
    
    // Role checks
    isAdmin,
    isManager,
    isEmployee,
    isCollaborator,
    
    // Permission check
    hasPermission,
    
    // Actions
    signOut,
  }), [
    isLoaded,
    isUserLoaded,
    isSignedIn,
    userId,
    sessionId,
    user,
    userRole,
    companyId,
    hasCompletedOnboarding,
    isAdmin,
    isManager,
    isEmployee,
    isCollaborator,
    signOut,
  ]);

  return authContext;
}