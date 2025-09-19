import React from 'react'
import { SignUp } from '@clerk/clerk-react'
import { ChefHat, Shield, Clock, Users } from 'lucide-react'

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Features */}
        <div className="hidden lg:block">
          <div className="text-center lg:text-left mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                HACCP Business Manager
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              La soluzione digitale per la gestione della sicurezza alimentare
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Compliance Automatica
                </h3>
                <p className="text-gray-600">
                  Rispetto automatico delle normative HACCP con audit trail completo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Operatività Offline
                </h3>
                <p className="text-gray-600">
                  Funziona anche senza connessione internet, sincronizzazione automatica
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Gestione Team
                </h3>
                <p className="text-gray-600">
                  Assegnazione mansioni, controllo accessi e monitoraggio attività
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white rounded-lg shadow-lg p-1">
            <SignUp 
              appearance={{
                elements: {
                  card: 'shadow-none border-0',
                  headerTitle: 'text-xl font-semibold text-gray-900',
                  headerSubtitle: 'text-gray-600',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
                  footerActionLink: 'text-blue-600 hover:text-blue-700',
                },
              }}
              redirectUrl="/onboarding"
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Registrandoti accetti i nostri{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700">
                Termini di Servizio
              </a>{' '}
              e la{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage