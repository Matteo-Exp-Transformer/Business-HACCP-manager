/**
 * Button Component - HACCP Design System
 * 
 * Professional button component with HACCP-specific variants and mobile optimization
 */

const buttonVariants = {
  // Primary actions - HACCP blue theme
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm',
  
  // Secondary actions - neutral theme
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500 border border-neutral-300',
  
  // Success actions - compliance and completion
  success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm',
  
  // Warning actions - attention required
  warning: 'bg-warning-500 text-warning-900 hover:bg-warning-600 focus:ring-warning-500 shadow-sm',
  
  // Destructive actions - critical operations
  destructive: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 shadow-sm',
  
  // Outline variant - secondary importance
  outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
  
  // Ghost variant - minimal styling
  ghost: 'text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500',
  
  // Link variant - text-only actions
  link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500'
}

const buttonSizes = {
  sm: 'h-8 px-3 text-xs mobile-tap-target',
  default: 'h-10 px-4 py-2 text-sm mobile-tap-target',
  lg: 'h-12 px-6 text-base mobile-tap-target',
  icon: 'h-10 w-10 mobile-tap-target',
  'icon-sm': 'h-8 w-8 mobile-tap-target',
  'icon-lg': 'h-12 w-12 mobile-tap-target'
}

export function Button({ 
  className = '', 
  variant = 'primary', 
  size = 'default', 
  loading = false,
  disabled = false,
  children,
  ...props 
}) {
  const isDisabled = disabled || loading
  
  return (
    <button
      className={`
        btn-base
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}