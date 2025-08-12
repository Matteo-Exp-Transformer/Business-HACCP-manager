/**
 * EmptyState - Componente per stati vuoti informativi
 * 
 * Mostra messaggi informativi quando non ci sono dati
 * Con pulsanti di azione e suggerimenti utili
 * 
 * @version 1.0
 * @critical User Experience - Stati vuoti informativi
 */

import React from 'react'
import { Button } from './Button'

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  hint,
  className = "",
  variant = "default"
}) => {
  const getVariantStyles = () => {
    const baseStyles = "text-center py-12 px-6 rounded-lg border-2 border-dashed"
    
    const variants = {
      default: "border-gray-300 bg-gray-50 text-gray-600",
      primary: "border-blue-300 bg-blue-50 text-blue-700",
      success: "border-green-300 bg-green-50 text-green-700",
      warning: "border-yellow-300 bg-yellow-50 text-yellow-700",
      error: "border-red-300 bg-red-50 text-red-700"
    }
    
    return `${baseStyles} ${variants[variant]}`
  }

  const getIconStyles = () => {
    const baseStyles = "mx-auto mb-4 text-gray-400"
    
    const variants = {
      default: "text-gray-400",
      primary: "text-blue-500",
      success: "text-green-500",
      warning: "text-yellow-500",
      error: "text-red-500"
    }
    
    return `${baseStyles} ${variants[variant]}`
  }

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {Icon && (
        <div className={getIconStyles()}>
          <Icon className="h-16 w-16 mx-auto" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>
      
      <p className="text-sm mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        <div className="mb-4">
          <Button 
            onClick={action.onClick}
            size="lg"
            className="px-6 py-3"
          >
            {action.icon && <action.icon className="h-5 w-5 mr-2" />}
            {action.text}
          </Button>
        </div>
      )}
      
      {hint && (
        <div className="text-xs opacity-75 max-w-sm mx-auto">
          💡 {hint}
        </div>
      )}
    </div>
  )
}

export default EmptyState

