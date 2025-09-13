/**
 * Componente AlertModal per sostituire alert()
 */

import React from 'react'
import Modal from './Modal'
import { Button } from './Button'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info',
  confirmText = 'OK',
  onConfirm = null
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-blue-600'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className={`text-lg font-semibold ${getIconColor()} mb-2`}>
              {title}
            </h3>
          )}
          <div className="text-gray-700 whitespace-pre-line">
            {message}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <Button onClick={handleConfirm} variant="primary">
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default AlertModal
