/**
 * Select Component - HACCP Design System
 * 
 * Dropdown select component with validation states and mobile optimization
 */

import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

const selectVariants = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  error: 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50',
  success: 'border-success-500 focus:border-success-500 focus:ring-success-500 bg-success-50',
  warning: 'border-warning-500 focus:border-warning-500 focus:ring-warning-500 bg-warning-50'
}

const selectSizes = {
  sm: 'h-8 px-2 py-1 text-xs',
  default: 'h-10 px-3 py-2 text-sm mobile-tap-target',
  lg: 'h-12 px-4 py-3 text-base mobile-tap-target'
}

export const Select = forwardRef(({ 
  className = '', 
  variant = 'default',
  size = 'default',
  error = false,
  disabled = false,
  placeholder = 'Seleziona...',
  children,
  ...props 
}, ref) => {
  const variantClass = error ? selectVariants.error : selectVariants[variant]
  
  return (
    <div className="relative">
      <select
        ref={ref}
        className={`
          form-input
          ${variantClass}
          ${selectSizes[size]}
          ${disabled ? 'bg-neutral-100 cursor-not-allowed' : 'bg-white'}
          appearance-none cursor-pointer pr-10
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
    </div>
  )
})

Select.displayName = 'Select'

export const SelectOption = ({ children, ...props }) => (
  <option {...props}>{children}</option>
)