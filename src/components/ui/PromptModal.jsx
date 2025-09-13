/**
 * Componente PromptModal per sostituire prompt()
 */

import React, { useState, useEffect } from 'react'
import Modal from './Modal'
import { Button } from './Button'
import { Input } from './Input'
import { Label } from './Label'
import { HelpCircle } from 'lucide-react'

const PromptModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  placeholder = '',
  defaultValue = '',
  type = 'text',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  onConfirm = null,
  onCancel = null,
  validation = null // funzione di validazione che restituisce { isValid: boolean, error: string }
}) => {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue)
      setError('')
    }
  }, [isOpen, defaultValue])

  const handleConfirm = () => {
    if (validation) {
      const validationResult = validation(value)
      if (!validationResult.isValid) {
        setError(validationResult.error)
        return
      }
    }
    
    if (onConfirm) {
      onConfirm(value)
    }
    onClose()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onClose()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-blue-600">
          <HelpCircle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-blue-600 mb-2">
              {title}
            </h3>
          )}
          <div className="text-gray-700 whitespace-pre-line mb-4">
            {message}
          </div>
          
          <div>
            <Label htmlFor="prompt-input" className="text-sm font-medium text-gray-700">
              Inserisci il valore:
            </Label>
            <Input
              id="prompt-input"
              type={type}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className={`mt-1 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6">
        <Button onClick={handleCancel} variant="secondary">
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} variant="primary">
          {confirmText}
        </Button>
      </div>
    </Modal>
  )
}

export default PromptModal
