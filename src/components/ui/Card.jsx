/**
 * Card Components - HACCP Design System
 * 
 * Card components with HACCP-specific styling and responsive design
 */

const cardVariants = {
  default: 'bg-white border-neutral-200 text-neutral-900',
  success: 'bg-success-50 border-success-200 text-success-900',
  warning: 'bg-warning-50 border-warning-200 text-warning-900',
  error: 'bg-error-50 border-error-200 text-error-900',
  primary: 'bg-primary-50 border-primary-200 text-primary-900'
}

export function Card({ 
  className = '', 
  variant = 'default',
  hover = false,
  ...props 
}) {
  return (
    <div
      className={`
        rounded-xl border card-shadow
        ${cardVariants[variant]}
        ${hover ? 'hover:shadow-medium cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    />
  )
}

export function CardHeader({ 
  className = '', 
  noPadding = false,
  ...props 
}) {
  return (
    <div 
      className={`
        flex flex-col space-y-1.5 
        ${noPadding ? '' : 'p-4 md:p-6'} 
        ${className}
      `} 
      {...props} 
    />
  )
}

export function CardTitle({ 
  className = '', 
  size = 'default',
  ...props 
}) {
  const sizeClasses = {
    sm: 'text-lg',
    default: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl'
  }
  
  return (
    <h3
      className={`
        font-semibold leading-tight tracking-tight text-neutral-900
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    />
  )
}

export function CardDescription({ className = '', ...props }) {
  return (
    <p 
      className={`text-sm md:text-base text-neutral-600 ${className}`} 
      {...props} 
    />
  )
}

export function CardContent({ 
  className = '', 
  noPadding = false,
  ...props 
}) {
  return (
    <div 
      className={`
        ${noPadding ? '' : 'p-4 md:p-6 pt-0'} 
        ${className}
      `} 
      {...props} 
    />
  )
}

export function CardFooter({ 
  className = '', 
  noPadding = false,
  ...props 
}) {
  return (
    <div 
      className={`
        flex items-center 
        ${noPadding ? '' : 'p-4 md:p-6 pt-0'} 
        ${className}
      `} 
      {...props} 
    />
  )
}