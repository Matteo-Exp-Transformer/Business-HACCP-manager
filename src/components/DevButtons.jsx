import React from 'react';
import { Button } from './ui/Button';
import { Users, RotateCcw } from 'lucide-react';

const DevButtons = ({ 
  onPrefillOnboarding, 
  onResetOnboarding, 
  isDevMode = false 
}) => {
  // Mostra sempre i pulsanti di sviluppo se:
  // 1. Siamo in modalità sviluppo (NODE_ENV === 'development')
  // 2. Siamo su un URL di preview (contiene 'vercel.app' o 'netlify.app')
  // 3. C'è un parametro URL ?dev=1
  // 4. Siamo in modalità dev tramite localStorage
  const isPreviewDeployment = window.location.hostname.includes('vercel.app') || 
                             window.location.hostname.includes('netlify.app') ||
                             window.location.hostname.includes('preview');
  
  const hasDevParam = new URLSearchParams(window.location.search).get('dev') === '1';
  
  const shouldShowDevButtons = isDevMode || isPreviewDeployment || hasDevParam;
  
  if (!shouldShowDevButtons) return null;

  return (
    <div className="flex gap-2">
      <Button
        onClick={onPrefillOnboarding}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 flex-1 sm:flex-none"
        title="Precompila onboarding con dati di test"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Precompila</span>
        <span className="sm:hidden">Precompila</span>
      </Button>
      
      <Button
        onClick={onResetOnboarding}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
        title="Reset completo onboarding e app"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="hidden sm:inline">Reset Onboarding</span>
        <span className="sm:hidden">Reset</span>
      </Button>
    </div>
  );
};

export default DevButtons;
