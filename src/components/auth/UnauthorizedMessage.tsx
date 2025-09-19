import React from 'react'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'

interface UnauthorizedMessageProps {
  message?: string
  description?: string
  showBackButton?: boolean
  onBack?: () => void
}

const UnauthorizedMessage: React.FC<UnauthorizedMessageProps> = ({
  message = "Accesso non autorizzato",
  description = "Non hai i permessi necessari per visualizzare questa pagina.",
  showBackButton = true,
  onBack,
}) => {
  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {message}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {description}
        </p>
        
        {showBackButton && (
          <Button
            onClick={handleBack}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna Indietro
          </Button>
        )}
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Se ritieni che questo sia un errore, contatta l'amministratore del sistema.
          </p>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedMessage