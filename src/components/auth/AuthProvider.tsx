import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { clerkConfig } from '../../lib/clerk'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!clerkPublishableKey) {
    console.error('Missing Clerk Publishable Key')
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Errore Configurazione
          </h1>
          <p className="text-gray-600 mb-4">
            La chiave di autenticazione non è configurata. 
            Contatta l'amministratore del sistema.
          </p>
          <p className="text-xs text-gray-500">
            VITE_CLERK_PUBLISHABLE_KEY mancante
          </p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkConfig.appearance}
      localization={clerkConfig.localization}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  )
}

export default AuthProvider