/**
 * Skeleton Loading Components - HACCP Design System
 * 
 * Loading skeleton components for various UI elements
 */

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`loading-skeleton ${className}`}
      {...props}
    />
  )
}

// Card skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`card-shadow rounded-xl border border-neutral-200 p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// List skeleton
export function ListSkeleton({ items = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Text skeleton
export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
        />
      ))}
    </div>
  )
}

// Avatar skeleton
export function AvatarSkeleton({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <Skeleton 
      className={`${sizeClasses[size]} rounded-full ${className}`}
    />
  )
}

// Button skeleton
export function ButtonSkeleton({ size = 'default', className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-20',
    default: 'h-10 w-24',
    lg: 'h-12 w-28'
  }

  return (
    <Skeleton 
      className={`${sizeClasses[size]} rounded-lg ${className}`}
    />
  )
}

// HACCP-specific skeletons
export function ConservationPointSkeleton({ className = '' }) {
  return (
    <CardSkeleton className={className}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    </CardSkeleton>
  )
}

export function TaskSkeleton({ className = '' }) {
  return (
    <div className={`border border-neutral-200 rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="w-16 h-8 rounded" />
      </div>
    </div>
  )
}

export default Skeleton