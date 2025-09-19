import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { clerkConfig } from '../../lib/clerk'

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

  if (!clerkPublishableKey || clerkPublishableKey === 'pk_test_temp_development_key_for_demo') {
    console.warn('Clerk not configured, using development mode')
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-yellow-600 mb-4">
            🚧 Modalità Sviluppo
          </h1>
          <p className="text-gray-600 mb-4">
            Clerk non è configurato. L'app funziona in modalità sviluppo con il sistema legacy.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Per configurare Clerk: crea account su clerk.com e aggiorna VITE_CLERK_PUBLISHABLE_KEY
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Continua in Modalità Legacy
          </button>
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