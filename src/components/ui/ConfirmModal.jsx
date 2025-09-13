/**
 * Componente ConfirmModal per sostituire confirm()
 */

import React from 'react'
import Modal from './Modal'
import { Button } from './Button'
import { AlertTriangle, HelpCircle } from 'lucide-react'

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  type = 'warning',
  onConfirm = null,
  onCancel = null
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return <HelpCircle className="h-6 w-6 text-blue-600" />
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-600'
      case 'danger':
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
      
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={handleCancel} variant="secondary">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} variant={type === 'danger' ? 'danger' : 'primary'}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
