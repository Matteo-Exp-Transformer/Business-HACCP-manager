/**
 * BottomSheetGuide - Guida per prerequisiti mancanti
 * 
 * Questo componente mostra un bottom sheet quando l'utente tenta di accedere
 * a una sezione che richiede prerequisiti non soddisfatti
 * 
 * @version 1.0
 * @critical UX - Guida utente per onboarding
 */

import React from 'react'
import { X, AlertTriangle, CheckCircle, ArrowRight, Info } from 'lucide-react'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

function BottomSheetGuide({ 
  isOpen, 
  onClose, 
  missingRequirements = [], 
  suggestions = [],
  onFixRequirement 
}) {
  if (!isOpen) return null

  const handleFixRequirement = (requirement) => {
    if (onFixRequirement) {
      onFixRequirement(requirement)
    }
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Prerequisiti Richiesti
                </h3>
                <p className="text-sm text-gray-600">
                  Completa questi passaggi per accedere alla sezione
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {missingRequirements.map((requirement, index) => {
              const suggestion = suggestions.find(s => s.requirement === requirement)
              return (
                <Card key={index} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-medium text-orange-600">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-orange-900 mb-2">
                          {suggestion?.action || `Completa ${requirement}`}
                        </h4>
                        
                        {suggestion?.description && (
                          <p className="text-sm text-orange-800 mb-3">
                            {suggestion.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleFixRequirement(requirement)}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Risolvi
                          </Button>
                          
                          <div className="flex items-center gap-1 text-xs text-orange-700">
                            <Info className="h-3 w-3" />
                            <span>Priorità: {suggestion?.priority === 'high' ? 'Alta' : 'Media'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {/* Educational Message */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Perché questi prerequisiti sono importanti?
                </p>
                <p className="text-sm text-blue-800">
                  I prerequisiti garantiscono che la tua struttura HACCP sia completa e funzionale. 
                  Ogni elemento contribuisce alla sicurezza alimentare e alla compliance normativa.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Chiudi
            </Button>
            
            <Button
              onClick={() => {
                // Apri l'onboarding wizard
                if (onFixRequirement) {
                  onFixRequirement('onboarding')
                }
                onClose()
              }}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Avvia Onboarding
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default BottomSheetGuide
