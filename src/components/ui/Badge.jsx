/**
 * Badge Component - HACCP Design System
 * 
 * Status badges with HACCP-specific variants for compliance states
 */

const badgeVariants = {
  // HACCP compliance states
  compliant: 'bg-success-100 text-success-800 border-success-200',
  warning: 'bg-warning-100 text-warning-800 border-warning-200', 
  critical: 'bg-error-100 text-error-800 border-error-200',
  
  // General states
  primary: 'bg-primary-100 text-primary-800 border-primary-200',
  secondary: 'bg-neutral-100 text-neutral-800 border-neutral-200',
  
  // Task states
  pending: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  'in-progress': 'bg-primary-100 text-primary-700 border-primary-200',
  completed: 'bg-success-100 text-success-700 border-success-200',
  overdue: 'bg-error-100 text-error-700 border-error-200',
  
  // Temperature states
  'temp-normal': 'bg-success-100 text-success-800 border-success-200',
  'temp-warning': 'bg-warning-100 text-warning-800 border-warning-200',
  'temp-critical': 'bg-error-100 text-error-800 border-error-200',
  
  // User roles
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  employee: 'bg-green-100 text-green-800 border-green-200',
  collaborator: 'bg-orange-100 text-orange-800 border-orange-200'
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  default: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
}

export function Badge({ 
  className = '', 
  variant = 'secondary', 
  size = 'default',
  children,
  ...props 
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// Status badge with icon
export function StatusBadge({ 
  status, 
  icon: Icon, 
  children, 
  className = '',
  ...props 
}) {
  return (
    <Badge variant={status} className={className} {...props}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </Badge>
  )
}

// HACCP compliance badge
export function ComplianceBadge({ 
  isCompliant, 
  children, 
  className = '',
  ...props 
}) {
  return (
    <Badge 
      variant={isCompliant ? 'compliant' : 'critical'} 
      className={className} 
      {...props}
    >
      {isCompliant ? '✅' : '❌'} {children}
    </Badge>
  )
}

// Temperature status badge
export function TemperatureBadge({ 
  temperature, 
  minTemp, 
  maxTemp, 
  className = '',
  ...props 
}) {
  const getVariant = () => {
    if (temperature < minTemp || temperature > maxTemp) return 'temp-critical'
    if (temperature <= minTemp + 1 || temperature >= maxTemp - 1) return 'temp-warning'
    return 'temp-normal'
  }

  const getIcon = () => {
    const variant = getVariant()
    if (variant === 'temp-critical') return '🚨'
    if (variant === 'temp-warning') return '⚠️'
    return '✅'
  }

  return (
    <Badge variant={getVariant()} className={className} {...props}>
      {getIcon()} {temperature}°C
    </Badge>
  )
}

export default Badge