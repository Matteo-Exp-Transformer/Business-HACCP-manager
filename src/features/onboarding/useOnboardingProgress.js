/**
 * Onboarding Progress Hook - HACCP Business Manager
 * 
 * Manages onboarding progress, validation, and persistence
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'
import { haccpComplianceSchema } from './schemas'

export const useOnboardingProgress = () => {
  const {
    onboarding,
    setOnboardingStep,
    markStepCompleted,
    updateOnboardingFormData,
    setOnboardingCompleted,
    resetOnboarding
  } = useAppStore()

  const [currentErrors, setCurrentErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  // Calculate progress percentage
  const getProgress = useCallback(() => {
    const totalSteps = 5 // Business, Departments, Staff, Conservation, Tasks
    const completedSteps = onboarding.stepsCompleted.length
    return Math.round((completedSteps / totalSteps) * 100)
  }, [onboarding.stepsCompleted])

  // Check if step is completed
  const isStepCompleted = useCallback((stepId) => {
    return onboarding.stepsCompleted.includes(stepId)
  }, [onboarding.stepsCompleted])

  // Check if step can be accessed
  const canAccessStep = useCallback((stepId) => {
    if (stepId === 1) return true // First step always accessible
    return isStepCompleted(stepId - 1) // Can access if previous step is completed
  }, [isStepCompleted])

  // Validate step data
  const validateStep = useCallback(async (stepId, data) => {
    setIsValidating(true)
    
    try {
      const stepSchemas = {
        1: 'businessInfoSchema',
        2: 'departmentsSchema',
        3: 'staffSchema',
        4: 'conservationPointsSchema',
        5: 'tasksSchema'
      }

      // Basic schema validation would go here
      // For now, we'll do basic checks
      
      const errors = {}
      
      // Step-specific validation
      switch (stepId) {
        case 1: // Business info
          if (!data.name?.trim()) errors.name = 'Nome richiesto'
          if (!data.address?.trim()) errors.address = 'Indirizzo richiesto'
          if (!data.email?.trim()) errors.email = 'Email richiesta'
          if (!data.employeeCount || data.employeeCount < 1) errors.employeeCount = 'Numero dipendenti richiesto'
          break

        case 2: // Departments
          if (!data.departments?.length) errors.departments = 'Almeno 1 reparto richiesto'
          break

        case 3: // Staff
          if (!data.staff?.length) errors.staff = 'Almeno 1 membro dello staff richiesto'
          break

        case 4: // Conservation points
          if (!data.conservationPoints?.length) {
            errors.conservationPoints = 'Almeno 1 punto di conservazione richiesto'
          }
          break

        case 5: // Tasks
          if (!data.tasks?.length) errors.tasks = 'Almeno 1 mansione richiesta'
          break
      }

      setCurrentErrors(errors)
      return Object.keys(errors).length === 0
      
    } catch (error) {
      console.error('Validation error:', error)
      setCurrentErrors({ general: 'Errore di validazione' })
      return false
    } finally {
      setIsValidating(false)
    }
  }, [])

  // Save step data
  const saveStepData = useCallback((stepId, data) => {
    const stepKeys = {
      1: 'business',
      2: 'departments', 
      3: 'staff',
      4: 'conservationPoints',
      5: 'tasks'
    }

    const stepKey = stepKeys[stepId]
    if (stepKey) {
      updateOnboardingFormData({ [stepKey]: data })
    }
  }, [updateOnboardingFormData])

  // Complete step
  const completeStep = useCallback(async (stepId, data) => {
    const isValid = await validateStep(stepId, data)
    
    if (isValid) {
      saveStepData(stepId, data)
      markStepCompleted(stepId)
      return true
    }
    
    return false
  }, [validateStep, saveStepData, markStepCompleted])

  // Go to next step
  const goToNextStep = useCallback((currentStep) => {
    const nextStep = currentStep + 1
    if (nextStep <= 6) { // Max 6 steps including completion
      setOnboardingStep(nextStep)
    }
  }, [setOnboardingStep])

  // Go to previous step
  const goToPreviousStep = useCallback((currentStep) => {
    const prevStep = currentStep - 1
    if (prevStep >= 1) {
      setOnboardingStep(prevStep)
    }
  }, [setOnboardingStep])

  // Check if onboarding can be completed
  const canCompleteOnboarding = useCallback(() => {
    const requiredSteps = [1, 2, 3, 4, 5]
    return requiredSteps.every(step => isStepCompleted(step))
  }, [isStepCompleted])

  // Complete entire onboarding
  const completeOnboarding = useCallback(async () => {
    if (!canCompleteOnboarding()) {
      return { success: false, error: 'Completare tutti i passaggi richiesti' }
    }

    try {
      // Final HACCP compliance validation
      const complianceResult = haccpComplianceSchema.validateMinimumRequirements(onboarding.formData)
      
      if (!complianceResult.valid) {
        return { 
          success: false, 
          error: 'Requisiti HACCP non soddisfatti: ' + complianceResult.errors.join(', ')
        }
      }

      // Mark as completed
      setOnboardingCompleted(true)
      
      return { success: true }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return { success: false, error: 'Errore durante il completamento' }
    }
  }, [canCompleteOnboarding, onboarding.formData, setOnboardingCompleted])

  // Get step summary for review
  const getStepSummary = useCallback((stepId) => {
    const stepData = {
      1: onboarding.formData.business,
      2: onboarding.formData.departments,
      3: onboarding.formData.staff,
      4: onboarding.formData.conservationPoints,
      5: onboarding.formData.tasks
    }

    const data = stepData[stepId]
    if (!data) return null

    switch (stepId) {
      case 1:
        return {
          title: 'Informazioni Azienda',
          items: [
            `Nome: ${data.name}`,
            `Tipo: ${data.businessType}`,
            `Dipendenti: ${data.employeeCount}`
          ]
        }
      
      case 2:
        return {
          title: 'Reparti',
          items: data.departments?.map(d => d.name) || []
        }
      
      case 3:
        return {
          title: 'Staff',
          items: data.staff?.map(s => `${s.firstName} ${s.lastName} (${s.role})`) || []
        }
      
      case 4:
        return {
          title: 'Punti di Conservazione',
          items: data.conservationPoints?.map(p => `${p.name} (${p.type})`) || []
        }
      
      case 5:
        return {
          title: 'Mansioni',
          items: data.tasks?.map(t => `${t.name} (${t.frequency})`) || []
        }
      
      default:
        return null
    }
  }, [onboarding.formData])

  return {
    // State
    onboarding,
    currentErrors,
    isValidating,
    
    // Progress
    getProgress,
    isStepCompleted,
    canAccessStep,
    canCompleteOnboarding,
    
    // Actions
    validateStep,
    saveStepData,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    completeOnboarding,
    resetOnboarding,
    
    // Utilities
    getStepSummary
  }
}

export default useOnboardingProgress