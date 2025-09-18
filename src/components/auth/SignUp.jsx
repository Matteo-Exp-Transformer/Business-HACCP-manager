import React from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { UtensilsCrossed, CheckCircle } from 'lucide-react';

export function SignUp() {
  const features = [
    'Gestione completa HACCP digitale',
    'Monitoraggio temperature automatico',
    'Calendario mansioni e scadenze',
    'Report e audit trail completo',
    'Funzionamento offline garantito',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-8">
        {/* Left Column - Features */}
        <div className="flex-1 lg:pr-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full shadow-lg mr-3">
                <UtensilsCrossed className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">HACCP Business Manager</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Digitalizza la sicurezza alimentare della tua attività
            </h2>
            <p className="text-lg text-gray-600">
              Semplifica la gestione HACCP con un sistema completo, intuitivo e sempre aggiornato.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Testimonial or Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700 italic">
              "Da quando abbiamo adottato HACCP Business Manager, le ispezioni sono diventate una passeggiata. 
              Tutto è tracciato, organizzato e sempre a portata di mano."
            </p>
            <p className="mt-3 text-sm text-gray-600 font-medium">
              - Marco R., Ristorante Da Mario
            </p>
          </div>
        </div>

        {/* Right Column - Sign Up Form */}
        <div className="flex-1 max-w-md">
          <div className="bg-white rounded-lg shadow-xl">
            <ClerkSignUp 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none',
                  headerTitle: 'text-2xl font-bold text-gray-900 mb-2',
                  headerSubtitle: 'text-gray-600',
                  socialButtonsBlockButton: 'w-full',
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200',
                  footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
                  identityPreviewText: 'text-gray-700',
                  identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
                  formFieldInput: 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
                  formFieldLabel: 'block text-sm font-medium text-gray-700 mb-1',
                  dividerLine: 'bg-gray-200',
                  dividerText: 'text-gray-500 text-sm',
                },
                layout: {
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'blockButton',
                },
              }}
              redirectUrl="/onboarding"
              afterSignUpUrl="/onboarding"
            />
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hai già un account? 
              <a href="/sign-in" className="ml-1 font-medium text-blue-600 hover:text-blue-700">
                Accedi
              </a>
            </p>
          </div>

          {/* Compliance Note */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Registrandoti accetti i nostri termini di servizio e la privacy policy.
              I tuoi dati sono protetti secondo le normative GDPR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}