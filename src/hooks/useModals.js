/**
 * Hook per gestire modali in modo centralizzato
 * Sostituisce alert/confirm/prompt con modali in-app
 */

import { useState, useCallback } from 'react'

export const useModals = () => {
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'OK',
    onConfirm: null
  })

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Conferma',
    cancelText: 'Annulla',
    type: 'warning',
    onConfirm: null,
    onCancel: null
  })

  const [promptModal, setPromptModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    defaultValue: '',
    type: 'text',
    confirmText: 'Conferma',
    cancelText: 'Annulla',
    validation: null,
    onConfirm: null,
    onCancel: null
  })

  // Funzioni per mostrare i modali
  const showAlert = useCallback((options) => {
    setAlertModal({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      onConfirm: options.onConfirm || null
    })
  }, [])

  const showConfirm = useCallback((options) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || 'Conferma',
      cancelText: options.cancelText || 'Annulla',
      type: options.type || 'warning',
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    })
  }, [])

  const showPrompt = useCallback((options) => {
    setPromptModal({
      isOpen: true,
      title: options.title || '',
      message: options.message || '',
      placeholder: options.placeholder || '',
      defaultValue: options.defaultValue || '',
      type: options.type || 'text',
      confirmText: options.confirmText || 'Conferma',
      cancelText: options.cancelText || 'Annulla',
      validation: options.validation || null,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null
    })
  }, [])

  // Funzioni per chiudere i modali
  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  const closePrompt = useCallback(() => {
    setPromptModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Funzioni di convenienza per casi comuni
  const alertSuccess = useCallback((message, title = 'Successo') => {
    showAlert({ title, message, type: 'success' })
  }, [showAlert])

  const alertError = useCallback((message, title = 'Errore') => {
    showAlert({ title, message, type: 'error' })
  }, [showAlert])

  const alertWarning = useCallback((message, title = 'Attenzione') => {
    showAlert({ title, message, type: 'warning' })
  }, [showAlert])

  const alertInfo = useCallback((message, title = 'Informazione') => {
    showAlert({ title, message, type: 'info' })
  }, [showAlert])

  const confirmDelete = useCallback((message, onConfirm, title = 'Conferma eliminazione') => {
    showConfirm({ 
      title, 
      message, 
      type: 'danger', 
      confirmText: 'Elimina',
      cancelText: 'Annulla',
      onConfirm 
    })
  }, [showConfirm])

  const confirmAction = useCallback((message, onConfirm, title = 'Conferma azione') => {
    showConfirm({ 
      title, 
      message, 
      type: 'warning', 
      confirmText: 'Conferma',
      cancelText: 'Annulla',
      onConfirm 
    })
  }, [showConfirm])

  const promptText = useCallback((message, onConfirm, options = {}) => {
    showPrompt({
      title: options.title || 'Inserisci testo',
      message,
      type: 'text',
      placeholder: options.placeholder || '',
      defaultValue: options.defaultValue || '',
      validation: options.validation || null,
      onConfirm
    })
  }, [showPrompt])

  const promptNumber = useCallback((message, onConfirm, options = {}) => {
    showPrompt({
      title: options.title || 'Inserisci numero',
      message,
      type: 'number',
      placeholder: options.placeholder || '',
      defaultValue: options.defaultValue || '',
      validation: options.validation || null,
      onConfirm
    })
  }, [showPrompt])

  return {
    // Stati modali
    alertModal,
    confirmModal,
    promptModal,
    
    // Funzioni per mostrare modali
    showAlert,
    showConfirm,
    showPrompt,
    
    // Funzioni per chiudere modali
    closeAlert,
    closeConfirm,
    closePrompt,
    
    // Funzioni di convenienza
    alertSuccess,
    alertError,
    alertWarning,
    alertInfo,
    confirmDelete,
    confirmAction,
    promptText,
    promptNumber
  }
}
