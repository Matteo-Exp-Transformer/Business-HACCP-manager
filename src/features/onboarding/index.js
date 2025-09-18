/**
 * Onboarding Feature Exports
 * 
 * Central export point for all onboarding-related components and utilities
 */

export { default as OnboardingWizard } from './OnboardingWizard'
export { default as StepNavigator, CompactStepNavigator } from './StepNavigator'
export { default as useOnboardingProgress } from './useOnboardingProgress'

// Export schemas for validation
export * from './schemas'

// Export step components
export { default as BusinessInfoStep } from './steps/BusinessInfoStep'
export { default as DepartmentsStep } from './steps/DepartmentsStep'

// Re-export form components for convenience
export {
  FormField,
  InputField,
  SelectField,
  CheckboxField,
  TextareaField,
  FormSection,
  FormActions
} from '../../components/forms/FormField'