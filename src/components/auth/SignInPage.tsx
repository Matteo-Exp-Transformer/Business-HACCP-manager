import React from 'react'
import { SignIn } from '@clerk/clerk-react'
import { ChefHat } from 'lucide-react'

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HACCP Business Manager
          </h1>
          <p className="text-gray-600">
            Sistema di Gestione Sicurezza Alimentare
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="bg-white rounded-lg shadow-lg p-1">
          <SignIn 
            appearance={{
              elements: {
                card: 'shadow-none border-0',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-gray-600',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                footerActionLink: 'text-blue-600 hover:text-blue-700',
              },
            }}
            redirectUrl="/dashboard"
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Sicurezza alimentare digitalizzata per ristoranti
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignInPage