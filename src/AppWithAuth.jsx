/**
 * 🚨 ATTENZIONE CRITICA - LEGGERE PRIMA DI MODIFICARE 🚨
 * 
 * Questo è il COMPONENTE PRINCIPALE con AUTENTICAZIONE dell'applicazione HACCP
 * 
 * PRIMA di qualsiasi modifica, leggi OBBLIGATORIAMENTE:
 * - AGENT_DIRECTIVES.md (nella root del progetto)
 * - HACCP_APP_DOCUMENTATION.md
 * 
 * ⚠️ MODIFICHE NON AUTORIZZATE POSSONO COMPROMETTERE LA SICUREZZA ALIMENTARE
 * ⚠️ Questo file gestisce l'autenticazione e l'accesso ai moduli critici HACCP
 * 
 * @fileoverview Componente Principale HACCP con Autenticazione Clerk
 * @version 2.0 - Integrazione Clerk Authentication
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';

// Auth Components
import { Login, SignUp, PasswordReset, AuthGuard } from './components/auth';

// Main App Component (existing)
import App from './App';

// Hook personalizzato per auth
import { useAuthContext } from './hooks/auth/useAuthContext';

function AppWithAuth() {
  const { isLoaded } = useAuth();

  // Show loading spinner while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento sistema HACCP...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in" element={
          <SignedOut>
            <Login />
          </SignedOut>
        } />
        
        <Route path="/sign-up" element={
          <SignedOut>
            <SignUp />
          </SignedOut>
        } />
        
        <Route path="/password-reset" element={
          <SignedOut>
            <PasswordReset />
          </SignedOut>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <SignedIn>
            <AuthenticatedApp />
          </SignedIn>
        } />

        <Route path="/onboarding" element={
          <SignedIn>
            <OnboardingRoute />
          </SignedIn>
        } />

        {/* Default Route */}
        <Route path="/" element={
          <>
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
            <SignedOut>
              <Navigate to="/sign-in" replace />
            </SignedOut>
          </>
        } />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Wrapper component for the main app with auth context
function AuthenticatedApp() {
  const authContext = useAuthContext();
  
  // Pass auth context to the existing App component
  // The existing App component will need to be modified to accept auth props
  return <App authContext={authContext} />;
}

// Onboarding route that checks if onboarding is needed
function OnboardingRoute() {
  const authContext = useAuthContext();
  
  // If onboarding is already completed, redirect to dashboard
  if (authContext.user?.hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show onboarding
  // The existing OnboardingWizard component will be used here
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Configurazione iniziale HACCP Business Manager
        </h1>
        <p className="text-gray-600 mb-8">
          Completa la configurazione iniziale per iniziare a utilizzare il sistema.
        </p>
        {/* TODO: Import and use the existing OnboardingWizard component here */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">
            [OnboardingWizard component verrà integrato qui]
          </p>
        </div>
      </div>
    </div>
  );
}

export default AppWithAuth;