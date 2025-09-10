import React from 'react';
import { Button } from './ui/Button';
import { Users, RotateCcw } from 'lucide-react';

const HeaderButtons = ({ 
  onResetApp, 
  onOpenOnboarding, 
  showResetApp = false 
}) => {
  return (
    <div className="flex gap-2">
      {/* Pulsante Reset App - Solo in modalità sviluppo */}
      {showResetApp && (
        <Button
          onClick={onResetApp}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          title="Reset completo dell'app (solo sviluppo)"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset App</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      )}
      
      {/* Pulsante Riapri Onboarding - Sempre visibile */}
      <Button
        onClick={onOpenOnboarding}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        title="Riapri l'onboarding"
      >
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Riapri Onboarding</span>
        <span className="sm:hidden">Onboarding</span>
      </Button>
    </div>
  );
};

export default HeaderButtons;
