import React from 'react';
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ children, requiredRole = null }) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  // Show loading spinner while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // TODO: Implement role-based access control
  // For now, just check if user is signed in
  // In the future, check user.publicMetadata.role against requiredRole

  return <>{children}</>;
}