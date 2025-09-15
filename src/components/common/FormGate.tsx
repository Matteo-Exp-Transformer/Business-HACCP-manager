/**
 * Form Gate - Foundation Pack v1
 * 
 * Componente per bloccare apertura form multipli
 * Mostra messaggio semplice quando c'è conflitto
 * 
 * @version 1.0
 * @critical Architettura - Form Manager
 */

import React, { ReactNode } from 'react'
import { useFormManager } from './FormManager'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '../ui/Button'

// ============================================================================
// INTERFACCE
// ============================================================================

export interface FormGateProps {
  entityType: string
  children: ReactNode
  fallback?: ReactNode
  showCloseButton?: boolean
  className?: string
}

// ============================================================================
// COMPONENTE PRINCIPALE
// ============================================================================

export const FormGate: React.FC<FormGateProps> = ({
  entityType,
  children,
  fallback,
  showCloseButton = true,
  className = ''
}) => {
  const { isFormOpen, getFormConflictMessage, closeForm } = useFormManager()
  
  // Se non c'è conflitto, mostra i children
  if (!isFormOpen(entityType)) {
    return <>{children}</>
  }
  
  // Se c'è conflitto, mostra il messaggio
  return (
    <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Form già aperto
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            {getFormConflictMessage(entityType)}
          </p>
          {fallback && (
            <div className="mt-3">
              {fallback}
            </div>
          )}
        </div>
        {showCloseButton && (
          <div className="ml-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => closeForm(entityType)}
              className="text-yellow-700 hover:text-yellow-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTI DI UTILITÀ
// ============================================================================

export const FormConflictMessage: React.FC<{
  entityType: string
  className?: string
}> = ({ entityType, className = '' }) => {
  const { isFormOpen, getFormConflictMessage } = useFormManager()
  
  if (!isFormOpen(entityType)) return null
  
  return (
    <div className={`p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 ${className}`}>
      {getFormConflictMessage(entityType)}
    </div>
  )
}

export const FormStatus: React.FC<{
  entityType: string
  className?: string
}> = ({ entityType, className = '' }) => {
  const { isFormOpen, getFormState } = useFormManager()
  
  if (!isFormOpen(entityType)) return null
  
  const formState = getFormState(entityType)
  const mode = formState.mode === 'create' ? 'Creazione' : 'Modifica'
  
  return (
    <div className={`p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 ${className}`}>
      Form {mode} attivo
    </div>
  )
}

export const FormDraftStatus: React.FC<{
  entityType: string
  className?: string
}> = ({ entityType, className = '' }) => {
  const { isFormOpen, getFormDraft } = useFormManager()
  
  if (!isFormOpen(entityType)) return null
  
  const draft = getFormDraft(entityType)
  const hasDraft = draft && Object.keys(draft).length > 0
  
  if (!hasDraft) return null
  
  return (
    <div className={`p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 ${className}`}>
      Bozza salvata
    </div>
  )
}

// ============================================================================
// HOOKS DI UTILITÀ
// ============================================================================

export const useFormGate = (entityType: string) => {
  const { isFormOpen, getFormConflictMessage, closeForm } = useFormManager()
  
  return {
    isBlocked: isFormOpen(entityType),
    conflictMessage: getFormConflictMessage(entityType),
    closeForm: () => closeForm(entityType)
  }
}

export const useFormStatus = (entityType: string) => {
  const { isFormOpen, getFormState, getFormDraft } = useFormManager()
  
  const formState = getFormState(entityType)
  const draft = getFormDraft(entityType)
  
  return {
    isOpen: isFormOpen(entityType),
    mode: formState.mode,
    hasDraft: draft && Object.keys(draft).length > 0,
    draftKeys: draft ? Object.keys(draft) : []
  }
}
