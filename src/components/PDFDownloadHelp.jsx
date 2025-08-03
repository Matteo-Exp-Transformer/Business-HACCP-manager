import React, { useState } from 'react'
import { AlertTriangle, Download, Chrome, Settings, HelpCircle } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

function PDFDownloadHelp({ isVisible, onClose }) {
  const [showDetails, setShowDetails] = useState(false)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Problema con il Download PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Se il download non funziona, prova questi passaggi:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Chrome className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Chrome - Disabilita Navigazione Sicura</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Vai su Impostazioni → Sicurezza → Disabilita "Navigazione sicura"
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Consenti Download</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Verifica che i download siano consentiti nelle impostazioni del browser
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Prova Browser Diverso</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Prova con Firefox o Edge se Chrome non funziona
                </p>
              </div>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm mb-2">Dettagli Tecnici:</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Il PDF viene generato lato client</li>
                <li>• Nessun dato viene inviato al server</li>
                <li>• Il file viene scaricato direttamente nel browser</li>
                <li>• Verifica che non ci siano estensioni che bloccano i download</li>
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <HelpCircle className="h-4 w-4" />
              {showDetails ? 'Nascondi' : 'Più Dettagli'}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1"
            >
              Ho Capito
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PDFDownloadHelp 