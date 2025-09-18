/**
 * Loading Spinner Component
 * 
 * Reusable loading spinner for various loading states
 */

import React from 'react'

const LoadingSpinner = ({ 
  size = 'default', 
  color = 'blue', 
  className = '',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colorClasses = {
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    white: 'border-white',
    green: 'border-green-600',
    red: 'border-red-600'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          border-4 
          ${colorClasses[color]} 
          border-t-transparent 
          rounded-full 
          animate-spin
        `}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner