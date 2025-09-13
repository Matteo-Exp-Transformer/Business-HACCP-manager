/**
 * Provider per i modali che include tutti i componenti modali
 */

import React from 'react'
import AlertModal from './AlertModal'
import ConfirmModal from './ConfirmModal'
import PromptModal from './PromptModal'

const ModalProvider = ({ 
  alertModal, 
  confirmModal, 
  promptModal, 
  closeAlert, 
  closeConfirm, 
  closePrompt 
}) => {
  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        confirmText={alertModal.confirmText}
        onConfirm={alertModal.onConfirm}
      />
      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />
      
      <PromptModal
        isOpen={promptModal.isOpen}
        onClose={closePrompt}
        title={promptModal.title}
        message={promptModal.message}
        placeholder={promptModal.placeholder}
        defaultValue={promptModal.defaultValue}
        type={promptModal.type}
        confirmText={promptModal.confirmText}
        cancelText={promptModal.cancelText}
        validation={promptModal.validation}
        onConfirm={promptModal.onConfirm}
        onCancel={promptModal.onCancel}
      />
    </>
  )
}

export default ModalProvider
