/**
 * Authentication Button Component
 * 
 * Displays sign in/out button based on authentication state
 */

import React from 'react'
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react'
import { LogIn, LogOut, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { getUserRole, isAdmin } from '../../lib/clerk'

const AuthButton = ({ variant = 'default', size = 'default' }) => {
  const { isSignedIn, user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <Button variant={variant} size={size} disabled>
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </Button>
    )
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button variant={variant} size={size}>
          <LogIn className="w-4 h-4 mr-2" />
          Accedi
        </Button>
      </SignInButton>
    )
  }

  const userRole = getUserRole(user)
  const isAdminUser = isAdmin(user)

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span className="font-medium">{user.firstName || user.emailAddresses[0].emailAddress}</span>
        {isAdminUser && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Admin
          </span>
        )}
      </div>
      <SignOutButton>
        <Button variant="outline" size={size}>
          <LogOut className="w-4 h-4 mr-2" />
          Esci
        </Button>
      </SignOutButton>
    </div>
  )
}

export default AuthButton