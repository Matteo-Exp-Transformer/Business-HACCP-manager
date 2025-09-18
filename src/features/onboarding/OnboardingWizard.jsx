/**
 * Onboarding Wizard - HACCP Business Manager
 * 
 * Multi-step wizard for initial business setup with HACCP compliance validation
 */

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'

// Import components
import { Button } from '../../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingState } from '../../components/layouts/PageLayout'

// Import schemas
import { stepValidationSchemas, haccpComplianceSchema } from './schemas'

// Import step components
import BusinessInfoStep from './steps/BusinessInfoStep'
import DepartmentsStep from './steps/DepartmentsStep'
import StaffStep from './steps/StaffStep'
import ConservationPointsStep from './steps/ConservationPointsStep'
import TasksStep from './steps/TasksStep'
import CompletionStep from './steps/CompletionStep'

// Import hooks
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/ui/Toast'

const OnboardingWizard = () => {
  const {
    onboarding,
    setOnboardingStep,
    markStepCompleted,
    updateOnboardingFormData,
    setOnboardingCompleted
  } = useAppStore()

  const [currentStep, setCurrentStep] = useState(onboarding.currentStep || 1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Form setup with React Hook Form
  const methods = useForm({
    resolver: zodResolver(stepValidationSchemas[currentStep]),
    defaultValues: onboarding.formData || {},
    mode: 'onBlur'
  })

  const { handleSubmit, formState: { errors, isValid }, watch, reset } = methods

  // Watch form data for auto-save
  const formData = watch()

  // Auto-save form data to store
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateOnboardingFormData({ [getStepKey(currentStep)]: formData })
    }, 1000) // Debounce auto-save

    return () => clearTimeout(timeoutId)
  }, [formData, currentStep, updateOnboardingFormData])

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: 'Informazioni Azienda',
      description: 'Dati principali della tua attività',
      component: BusinessInfoStep,
      key: 'business'
    },
    {
      id: 2,
      title: 'Reparti',
      description: 'Organizzazione dei reparti di lavoro',
      component: DepartmentsStep,
      key: 'departments'
    },
    {
      id: 3,
      title: 'Staff',
      description: 'Gestione del personale',
      component: StaffStep,
      key: 'staff'
    },
    {
      id: 4,
      title: 'Punti di Conservazione',
      description: 'Frigoriferi, freezer e aree di stoccaggio',
      component: ConservationPointsStep,
      key: 'conservationPoints'
    },
    {
      id: 5,
      title: 'Mansioni Base',
      description: 'Configurazione mansioni essenziali',
      component: TasksStep,
      key: 'tasks'
    },
    {
      id: 6,
      title: 'Completamento',
      description: 'Riepilogo e finalizzazione',
      component: CompletionStep,
      key: 'completion'
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)

  // Get step key for data storage
  const getStepKey = (stepId) => {
    return steps.find(step => step.id === stepId)?.key || 'unknown'
  }

  // Validate current step
  const validateCurrentStep = async () => {
    try {
      const schema = stepValidationSchemas[currentStep]
      if (schema) {
        await schema.parseAsync(formData)
      }
      
      // Additional HACCP compliance validation
      if (currentStep === 4) { // Conservation points
        const complianceResult = haccpComplianceSchema.validateMinimumRequirements({
          conservationPoints: { conservationPoints: formData.conservationPoints || [] }
        })
        
        if (!complianceResult.valid) {
          setValidationErrors({ haccp: complianceResult.errors })
          return false
        }
      }
      
      setValidationErrors({})
      return true
    } catch (error) {
      if (error.errors) {
        const fieldErrors = {}
        error.errors.forEach(err => {
          fieldErrors[err.path.join('.')] = err.message
        })
        setValidationErrors(fieldErrors)
      }
      return false
    }
  }

  // Handle next step
  const handleNext = async () => {
    const isStepValid = await validateCurrentStep()
    
    if (!isStepValid) {
      showToast.error(
        'Errori di validazione',
        'Correggi gli errori prima di continuare'
      )
      return
    }

    // Mark current step as completed
    markStepCompleted(currentStep)
    
    // Save current step data
    updateOnboardingFormData({ [getStepKey(currentStep)]: formData })
    
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setOnboardingStep(nextStep)
      
      // Reset form for next step
      const nextStepData = onboarding.formData[getStepKey(nextStep)] || {}
      reset(nextStepData)
      
      showToast.success('Passaggio completato', `Procedi con: ${steps[nextStep - 1]?.title}`)
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      setOnboardingStep(prevStep)
      
      // Load previous step data
      const prevStepData = onboarding.formData[getStepKey(prevStep)] || {}
      reset(prevStepData)
    }
  }

  // Handle final submission
  const handleFinalSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Validate complete onboarding data
      const completeData = {
        ...onboarding.formData,
        [getStepKey(currentStep)]: data
      }

      // Final HACCP compliance check
      const complianceResult = haccpComplianceSchema.validateMinimumRequirements(completeData)
      
      if (!complianceResult.valid) {
        showToast.error(
          'Configurazione incompleta',
          complianceResult.errors.join(', ')
        )
        return
      }

      // Save final data
      updateOnboardingFormData(completeData)
      
      // Mark onboarding as completed
      setOnboardingCompleted(true)
      
      showToast.compliance(
        'Configurazione completata',
        'Il sistema HACCP è pronto per l\'uso'
      )

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
      showToast.error(
        'Errore di configurazione',
        'Si è verificato un errore durante il salvataggio'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Progress calculation
  const progress = Math.round((onboarding.stepsCompleted.length / (steps.length - 1)) * 100)

  if (isSubmitting) {
    return (
      <LoadingState 
        title="Finalizzazione configurazione..."
        description="Stiamo configurando il tuo sistema HACCP"
      />
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Configurazione HACCP Manager
          </h1>
          <p className="text-neutral-600">
            Configura il tuo sistema di gestione della sicurezza alimentare
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Passaggio {currentStep} di {steps.length}
            </span>
            <Badge variant="primary">
              {progress}% completato
            </Badge>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-200
                  ${currentStep === step.id 
                    ? 'bg-primary-600 text-white' 
                    : onboarding.stepsCompleted.includes(step.id)
                    ? 'bg-success-600 text-white'
                    : 'bg-neutral-200 text-neutral-600'
                  }
                `}>
                  {onboarding.stepsCompleted.includes(step.id) ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 mx-2
                    ${onboarding.stepsCompleted.includes(step.id) 
                      ? 'bg-success-600' 
                      : 'bg-neutral-200'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <Card className="shadow-strong">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-600">
                  {currentStep}
                </span>
              </div>
              <div>
                <CardTitle size="sm">
                  {currentStepData?.title}
                </CardTitle>
                <p className="text-neutral-600 mt-1">
                  {currentStepData?.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(currentStep === steps.length ? handleFinalSubmit : handleNext)}>
                {/* Validation errors display */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-error-600" />
                      <h4 className="font-medium text-error-900">
                        Errori di validazione
                      </h4>
                    </div>
                    <ul className="space-y-1 text-sm text-error-700">
                      {Object.entries(validationErrors).map(([field, message]) => (
                        <li key={field}>• {message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Current step component */}
                {currentStepData && (
                  <currentStepData.component
                    formData={formData}
                    errors={errors}
                    onboarding={onboarding}
                  />
                )}
              </form>
            </FormProvider>
          </CardContent>

          <CardFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Indietro
              </Button>

              <div className="flex items-center gap-3">
                {currentStep < steps.length ? (
                  <Button
                    type="submit"
                    onClick={handleNext}
                    disabled={!isValid}
                  >
                    Continua
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="success"
                    onClick={handleSubmit(handleFinalSubmit)}
                    loading={isSubmitting}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Completa Configurazione
                  </Button>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Help text */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-500">
            Hai bisogno di aiuto? Consulta la{' '}
            <a href="/help" className="text-primary-600 hover:text-primary-700 underline">
              guida HACCP
            </a>
            {' '}o contatta il supporto.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingWizard