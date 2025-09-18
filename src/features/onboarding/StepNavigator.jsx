/**
 * Step Navigator Component - Onboarding Wizard
 * 
 * Navigation component for onboarding steps with progress tracking
 */

import { CheckCircle, Circle, ChevronRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import useOnboardingProgress from './useOnboardingProgress'

const StepNavigator = ({ 
  currentStep, 
  onStepChange, 
  steps,
  className = '' 
}) => {
  const { isStepCompleted, canAccessStep, getProgress } = useOnboardingProgress()

  const handleStepClick = (stepId) => {
    if (canAccessStep(stepId)) {
      onStepChange(stepId)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress overview */}
      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div>
          <h3 className="font-medium text-primary-900">
            Progresso Configurazione
          </h3>
          <p className="text-sm text-primary-700">
            Passaggio {currentStep} di {steps.length}
          </p>
        </div>
        <Badge variant="primary" size="lg">
          {getProgress()}%
        </Badge>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id)
          const isCurrent = currentStep === step.id
          const canAccess = canAccessStep(step.id)
          
          return (
            <div key={step.id} className="flex items-center">
              <Button
                variant={isCurrent ? 'primary' : isCompleted ? 'success' : 'outline'}
                onClick={() => handleStepClick(step.id)}
                disabled={!canAccess}
                className={`
                  w-full justify-start text-left h-auto py-3 px-4
                  ${!canAccess ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  {/* Step indicator */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCurrent 
                      ? 'bg-white text-primary-600' 
                      : isCompleted 
                      ? 'bg-white text-success-600'
                      : 'bg-transparent text-neutral-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 min-w-0">
                    <div className={`
                      font-medium
                      ${isCurrent ? 'text-white' : isCompleted ? 'text-white' : 'text-neutral-700'}
                    `}>
                      {step.title}
                    </div>
                    <div className={`
                      text-sm
                      ${isCurrent ? 'text-primary-100' : isCompleted ? 'text-success-100' : 'text-neutral-500'}
                    `}>
                      {step.description}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  {canAccess && (
                    <ChevronRight className={`
                      w-5 h-5 flex-shrink-0
                      ${isCurrent ? 'text-white' : isCompleted ? 'text-white' : 'text-neutral-400'}
                    `} />
                  )}
                </div>
              </Button>
            </div>
          )
        })}
      </div>

      {/* Help text */}
      <div className="text-center pt-4">
        <p className="text-xs text-neutral-500">
          Completa tutti i passaggi per attivare il sistema HACCP
        </p>
      </div>
    </div>
  )
}

// Compact step navigator for mobile
export const CompactStepNavigator = ({ 
  currentStep, 
  totalSteps,
  className = '' 
}) => {
  const { getProgress } = useOnboardingProgress()

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-700">
            Passaggio {currentStep} di {totalSteps}
          </span>
          <Badge variant="primary">
            {getProgress()}%
          </Badge>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepId = index + 1
          const isCompleted = useOnboardingProgress().isStepCompleted(stepId)
          const isCurrent = currentStep === stepId
          
          return (
            <div
              key={stepId}
              className={`
                w-2 h-2 rounded-full transition-all duration-200
                ${isCurrent 
                  ? 'bg-primary-600 scale-125' 
                  : isCompleted 
                  ? 'bg-success-600'
                  : 'bg-neutral-300'
                }
              `}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StepNavigator