/**
 * Authentication Provider Component
 * 
 * This component wraps the app with Clerk authentication
 * and provides authentication context throughout the application
 */

import React from 'react'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import clerkConfig from '../../lib/clerk'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const AuthProvider = ({ children }) => {
  return (
    <ClerkProvider {...clerkConfig}>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  )
}

export default AuthProvider