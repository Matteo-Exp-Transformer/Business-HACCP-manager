/**
 * UI Component Types - HACCP Design System
 * 
 * Type definitions for UI components (will be converted to TypeScript)
 */

// Button component props
export const ButtonProps = {
  variant: ['primary', 'secondary', 'success', 'warning', 'destructive', 'outline', 'ghost', 'link'],
  size: ['sm', 'default', 'lg', 'icon', 'icon-sm', 'icon-lg'],
  loading: 'boolean',
  disabled: 'boolean'
}

// Input component props  
export const InputProps = {
  variant: ['default', 'error', 'success', 'warning'],
  size: ['sm', 'default', 'lg'],
  error: 'boolean',
  disabled: 'boolean'
}

// Card component props
export const CardProps = {
  variant: ['default', 'success', 'warning', 'error', 'primary'],
  hover: 'boolean'
}

// Modal component props
export const ModalProps = {
  size: ['sm', 'md', 'lg', 'xl', 'full'],
  showCloseButton: 'boolean',
  closeOnBackdrop: 'boolean'
}

// Badge component props
export const BadgeProps = {
  variant: [
    'compliant', 'warning', 'critical',
    'primary', 'secondary',
    'pending', 'in-progress', 'completed', 'overdue',
    'temp-normal', 'temp-warning', 'temp-critical',
    'admin', 'manager', 'employee', 'collaborator'
  ],
  size: ['sm', 'default', 'lg']
}

// Select component props
export const SelectProps = {
  variant: ['default', 'error', 'success', 'warning'],
  size: ['sm', 'default', 'lg'],
  error: 'boolean',
  disabled: 'boolean'
}

// Checkbox component props
export const CheckboxProps = {
  variant: ['default', 'success', 'warning', 'error'],
  checked: 'boolean',
  disabled: 'boolean'
}

// Skeleton component props
export const SkeletonProps = {
  // No specific variants, uses className for customization
}

// Toast notification types
export const ToastTypes = {
  success: 'Success notification',
  error: 'Error notification', 
  warning: 'Warning notification',
  info: 'Info notification',
  compliance: 'HACCP compliance notification',
  nonCompliance: 'HACCP non-compliance notification',
  temperatureAlert: 'Temperature alert notification',
  taskReminder: 'Task reminder notification'
}

// Form field props
export const FormFieldProps = {
  required: 'boolean',
  error: 'string',
  description: 'string'
}

// HACCP-specific component states
export const HACCPStates = {
  compliance: ['compliant', 'warning', 'critical'],
  temperature: ['normal', 'warning', 'critical'],
  task: ['pending', 'in-progress', 'completed', 'overdue'],
  maintenance: ['up-to-date', 'due-soon', 'overdue'],
  product: ['fresh', 'expiring-soon', 'expired']
}

// Color mappings for HACCP states
export const HACCPColors = {
  compliant: 'success',
  warning: 'warning', 
  critical: 'error',
  normal: 'success',
  pending: 'neutral',
  'in-progress': 'primary',
  completed: 'success',
  overdue: 'error',
  'up-to-date': 'success',
  'due-soon': 'warning',
  fresh: 'success',
  'expiring-soon': 'warning',
  expired: 'error'
}

export default {
  ButtonProps,
  InputProps,
  CardProps,
  ModalProps,
  BadgeProps,
  SelectProps,
  CheckboxProps,
  SkeletonProps,
  ToastTypes,
  FormFieldProps,
  HACCPStates,
  HACCPColors
}