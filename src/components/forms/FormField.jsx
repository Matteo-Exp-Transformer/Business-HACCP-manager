/**
 * Form Field Components - HACCP Design System
 * 
 * Comprehensive form field components with validation and accessibility
 */

import { Input } from '../ui/Input'
import { Select, SelectOption } from '../ui/Select'
import { CheckboxWithLabel } from '../ui/Checkbox'

// Form field wrapper with label and error handling
export const FormField = ({ 
  label,
  error,
  required = false,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="form-helper">{description}</p>
      )}
      {children}
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  )
}

// Input field with integrated label and error
export const InputField = ({ 
  label,
  error,
  required = false,
  description,
  className = '',
  ...inputProps
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required} 
      description={description}
      className={className}
    >
      <Input error={!!error} {...inputProps} />
    </FormField>
  )
}

// Select field with integrated label and error
export const SelectField = ({ 
  label,
  error,
  required = false,
  description,
  options = [],
  placeholder = 'Seleziona...',
  className = '',
  ...selectProps
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required} 
      description={description}
      className={className}
    >
      <Select error={!!error} placeholder={placeholder} {...selectProps}>
        {options.map((option) => (
          <SelectOption 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectOption>
        ))}
      </Select>
    </FormField>
  )
}

// Checkbox field with integrated label and error
export const CheckboxField = ({ 
  label,
  error,
  required = false,
  description,
  className = '',
  ...checkboxProps
}) => {
  return (
    <div className={className}>
      <CheckboxWithLabel
        label={label}
        description={description}
        error={error}
        required={required}
        {...checkboxProps}
      />
    </div>
  )
}

// Textarea field
export const TextareaField = ({ 
  label,
  error,
  required = false,
  description,
  rows = 3,
  className = '',
  ...textareaProps
}) => {
  return (
    <FormField 
      label={label} 
      error={error} 
      required={required} 
      description={description}
      className={className}
    >
      <textarea
        rows={rows}
        className={`
          form-input resize-none
          ${error ? 'border-error-500 focus:border-error-500 focus:ring-error-500 bg-error-50' : ''}
        `}
        {...textareaProps}
      />
    </FormField>
  )
}

// Form section wrapper
export const FormSection = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => (
  <div className={`space-y-4 ${className}`}>
    {title && (
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-neutral-900">{title}</h3>
        {description && (
          <p className="text-sm text-neutral-600">{description}</p>
        )}
      </div>
    )}
    <div className="space-y-4">
      {children}
    </div>
  </div>
)

// Form actions (buttons) wrapper
export const FormActions = ({ 
  children, 
  align = 'right',
  className = '' 
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  }

  return (
    <div className={`
      flex items-center gap-3 pt-6 border-t border-neutral-200
      ${alignClasses[align]}
      ${className}
    `}>
      {children}
    </div>
  )
}