/**
 * Toast - Componente per notifiche temporanee
 * 
 * Sistema di notifiche toast per feedback immediato all'utente
 * Supporta diversi tipi: success, warning, error
 * 
 * @version 1.0
 * @critical User Experience - Feedback immediato
 */

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose, 
  position = 'bottom-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Aspetta l'animazione
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  const getToastStyles = () => {
    const baseStyles = "fixed z-50 max-w-sm w-full bg-white shadow-lg rounded-lg border-l-4 transition-all duration-300 ease-in-out"
    
    const typeStyles = {
      success: "border-green-500 bg-green-50",
      warning: "border-yellow-500 bg-yellow-50", 
      error: "border-red-500 bg-red-50",
      info: "border-blue-500 bg-blue-50"
    }
    
    const positionStyles = {
      'top-left': "top-4 left-4",
      'top-right': "top-4 right-4",
      'bottom-left': "bottom-4 left-4",
      'bottom-right': "bottom-4 right-4",
      'top-center': "top-4 left-1/2 transform -translate-x-1/2",
      'bottom-center': "bottom-4 left-1/2 transform -translate-x-1/2"
    }
    
    return `${baseStyles} ${typeStyles[type]} ${positionStyles[position]}`
  }

  const getIcon = () => {
    const iconClasses = "h-5 w-5"
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-600`} />
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-600`} />
      case 'error':
        return <XCircle className={`${iconClasses} text-red-600`} />
      default:
        return <Info className={`${iconClasses} text-blue-600`} />
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return "text-green-800"
      case 'warning':
        return "text-yellow-800"
      case 'error':
        return "text-red-800"
      default:
        return "text-blue-800"
    }
  }

  if (!isVisible) return null

  return (
    <div className={`${getToastStyles()} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast

