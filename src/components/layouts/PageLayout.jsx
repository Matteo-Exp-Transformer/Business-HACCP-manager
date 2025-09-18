/**
 * Page Layout Component - HACCP Design System
 * 
 * Standard page layout with header, actions, and content sections
 */

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export const PageLayout = ({ 
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-neutral-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div>
        {children}
      </div>
    </div>
  )
}

// Section layout for organizing page content
export const SectionLayout = ({ 
  title,
  subtitle,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {title && (
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-neutral-900">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-neutral-600 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

// Grid layout for cards and components
export const GridLayout = ({ 
  columns = 'auto',
  gap = 'default',
  children,
  className = ''
}) => {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-3',
    default: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  }

  return (
    <div className={`
      grid ${columnClasses[columns]} ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  )
}

// Empty state layout
export const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <div className="space-y-4">
        {Icon && (
          <div className="w-16 h-16 mx-auto bg-neutral-100 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-neutral-400" />
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-neutral-900">
            {title}
          </h3>
          {description && (
            <p className="text-neutral-600 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="pt-2">
            {action}
          </div>
        )}
      </div>
    </Card>
  )
}

// Error state layout
export const ErrorState = ({ 
  title = 'Errore di caricamento',
  description = 'Si è verificato un errore durante il caricamento dei dati.',
  onRetry,
  className = ''
}) => {
  return (
    <Card variant="error" className={`text-center py-12 ${className}`}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-error-100 rounded-full flex items-center justify-center">
          <X className="w-8 h-8 text-error-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-error-900">
            {title}
          </h3>
          <p className="text-error-700 max-w-md mx-auto">
            {description}
          </p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Riprova
          </Button>
        )}
      </div>
    </Card>
  )
}

// Loading state layout
export const LoadingState = ({ 
  title = 'Caricamento...',
  description,
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-neutral-900">
            {title}
          </h3>
          {description && (
            <p className="text-neutral-600 max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AppLayout