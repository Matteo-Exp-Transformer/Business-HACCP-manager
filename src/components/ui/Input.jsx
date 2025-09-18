/**
 * Input Component - HACCP Design System
 * 
 * Form input component with validation states and mobile optimization
 */

import { forwardRef } from 'react'

const inputVariants = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50',
  success: 'border-success-500 focus:border-success-500 focus:ring-success-500 bg-success-50',
  warning: 'border-warning-500 focus:border-warning-500 focus:ring-warning-500 bg-warning-50'
}

const inputSizes = {
  sm: 'h-8 px-2 py-1 text-xs',
  default: 'h-10 px-3 py-2 text-sm mobile-tap-target',
  lg: 'h-12 px-4 py-3 text-base mobile-tap-target'
}

export const Input = forwardRef(({ 
  className = '', 
  type = 'text',
  variant = 'default',
  size = 'default',
  error = false,
  disabled = false,
  ...props 
}, ref) => {
  const variantClass = error ? inputVariants.error : inputVariants[variant]
  
  return (
    <input
      ref={ref}
      type={type}
      className={`
        form-input
        ${variantClass}
        ${inputSizes[size]}
        ${disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    />
  )
})

Input.displayName = 'Input'