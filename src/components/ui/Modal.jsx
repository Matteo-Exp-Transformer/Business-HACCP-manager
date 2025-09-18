/**
 * Modal Component - HACCP Design System
 * 
 * Professional modal component with accessibility and mobile optimization
 */

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

const modalSizes = {
  sm: 'max-w-md',
  md: 'max-w-lg', 
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl'
}

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  variant = 'default'
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className="flex min-h-screen items-center justify-center p-4 safe-area-top safe-area-bottom"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        
        {/* Modal */}
        <div className={`
          relative w-full ${modalSizes[size]} 
          animate-scale-in
          ${className}
        `}>
          <div className="bg-white rounded-2xl shadow-strong border border-neutral-200">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-200">
                <h3 
                  id="modal-title"
                  className="text-lg md:text-xl font-semibold text-neutral-900"
                >
                  {title}
                </h3>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-4 md:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal footer component
export const ModalFooter = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 ${className}`}>
    {children}
  </div>
)

// Confirmation modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Conferma azione',
  message = 'Sei sicuro di voler continuare?',
  confirmText = 'Conferma',
  cancelText = 'Annulla',
  variant = 'destructive',
  loading = false
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="space-y-4">
      <p className="text-neutral-700">{message}</p>
      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button 
          variant={variant} 
          onClick={onConfirm} 
          loading={loading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </div>
  </Modal>
)

export default Modal
