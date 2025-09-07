/**
 * StepNavigator - Componente per navigazione tra step dell'onboarding
 * 
 * Permette all'utente di navigare tra gli step completati dell'onboarding
 * cliccando sui numeri degli step.
 * 
 * @version 1.0
 * @critical Onboarding - Navigazione step
 */

import React from 'react';
import { CheckCircle, Lock } from 'lucide-react';

const StepNavigator = ({ 
  currentStep, 
  completedSteps, 
  onStepClick, 
  steps 
}) => {
  const handleStepClick = (stepIndex, stepId) => {
    // Permetti navigazione solo agli step completati o al primo step
    if (stepIndex === 0 || completedSteps.has(stepId)) {
      onStepClick(stepIndex);
    }
  };

  const isStepAccessible = (stepIndex, stepId) => {
    return stepIndex === 0 || completedSteps.has(stepId);
  };

  const isStepCompleted = (stepId) => {
    return completedSteps.has(stepId);
  };

  const isCurrentStep = (stepIndex) => {
    return stepIndex === currentStep;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {steps.map((step, index) => {
        const accessible = isStepAccessible(index, step.id);
        const completed = isStepCompleted(step.id);
        const current = isCurrentStep(index);
        
        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => handleStepClick(index, step.id)}
              disabled={!accessible}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-200 ease-in-out
                ${current 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : completed 
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105 cursor-pointer' 
                    : accessible 
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:scale-105 cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
                ${accessible ? 'hover:shadow-md' : ''}
              `}
              title={
                current 
                  ? `Step corrente: ${step.title}`
                  : completed 
                    ? `Vai allo step ${index + 1}: ${step.title}` 
                    : index === 0 
                      ? `Step ${index + 1}: ${step.title}` 
                      : `Completa gli step precedenti per accedere a: ${step.title}`
              }
            >
              {completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : !accessible ? (
                <Lock className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </button>
            
            {/* Connettore tra step */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  w-8 h-0.5 mx-1
                  ${completed ? 'bg-green-500' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepNavigator;
