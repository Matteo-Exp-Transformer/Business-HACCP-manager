/**
 * Checkbox Component - HACCP Design System
 * 
 * Checkbox component with HACCP-specific styling and mobile optimization
 */

import { forwardRef } from 'react'
import { Check } from 'lucide-react'

const checkboxVariants = {
  default: 'border-neutral-300 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600',
  success: 'border-neutral-300 data-[state=checked]:bg-success-600 data-[state=checked]:border-success-600',
  warning: 'border-neutral-300 data-[state=checked]:bg-warning-600 data-[state=checked]:border-warning-600',
  error: 'border-error-500 data-[state=checked]:bg-error-600 data-[state=checked]:border-error-600'
}

export const Checkbox = forwardRef(({ 
  className = '', 
  variant = 'default',
  checked = false,
  disabled = false,
  onChange,
  id,
  ...props 
}, ref) => {
  return (
    <div className="relative inline-flex items-center">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <label
        htmlFor={id}
        className={`
          inline-flex items-center justify-center w-5 h-5 border-2 rounded
          transition-all duration-200 cursor-pointer mobile-tap-target
          ${checkboxVariants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${checked ? 'text-white' : 'text-transparent'}
          ${className}
        `}
      >
        <Check className="w-3 h-3" />
      </label>
    </div>
  )
})

Checkbox.displayName = 'Checkbox'

// Checkbox with label component
export const CheckboxWithLabel = ({ 
  label, 
  description,
  error,
  required = false,
  className = '',
  ...checkboxProps 
}) => {
  const id = checkboxProps.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-3">
        <Checkbox id={id} {...checkboxProps} />
        <div className="flex-1 min-w-0">
          <label htmlFor={id} className="form-label cursor-pointer">
            {label}
            {required && <span className="text-error-600 ml-1">*</span>}
          </label>
          {description && (
            <p className="form-helper">{description}</p>
          )}
          {error && (
            <p className="form-error">{error}</p>
          )}
        </div>
      </div>
    </div>
  )
}