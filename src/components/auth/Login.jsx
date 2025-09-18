import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { UtensilsCrossed } from 'lucide-react';

export function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full shadow-lg">
              <UtensilsCrossed className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HACCP Business Manager</h1>
          <p className="mt-2 text-gray-600">Sistema digitale per la gestione della sicurezza alimentare</p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="bg-white rounded-lg shadow-xl">
          <SignIn 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
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
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        </div>

        {/* Additional Information */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Prima volta? 
            <a href="/sign-up" className="ml-1 font-medium text-blue-600 hover:text-blue-700">
              Registra la tua attività
            </a>
          </p>
        </div>

        {/* Compliance Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Conforme alle normative HACCP e GDPR per la sicurezza alimentare
          </p>
        </div>
      </div>
    </div>
  );
}